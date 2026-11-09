import { createClient } from "npm:@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "npm:jose@5.9.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getGoogleAccessToken(serviceAccount: Record<string, string>) {
  const privateKey = serviceAccount.private_key?.replace(/\\n/g, "\n");
  if (!privateKey || !serviceAccount.client_email) {
    throw new Error("Firebase service account is missing client_email or private_key.");
  }
  const key = await importPKCS8(privateKey, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error_description || result.error || "Google OAuth failed.");
  return result.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "Authorization required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
    const serviceAccountRaw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!projectId || !serviceAccountRaw || !serviceRoleKey) {
      return json({ error: "Server push configuration is incomplete." }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Invalid session." }, 401);
    const callerId = userData.user.id;

    const { callSignalId } = await req.json();
    if (typeof callSignalId !== "string") return json({ error: "callSignalId is required." }, 400);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: signal, error: signalError } = await admin
      .from("htc_call_signals")
      .select("id,conversation_id,sender_id,recipient_id,signal_type,payload")
      .eq("id", callSignalId)
      .maybeSingle();

    if (signalError || !signal) return json({ error: "Call offer not found." }, 404);
    if (signal.sender_id !== callerId || signal.signal_type !== "offer") {
      return json({ error: "Not authorized to notify for this call." }, 403);
    }
    const callKey = signal.payload?.callKey;
    const mode = signal.payload?.mode === "video" ? "video" : "audio";
    if (!callKey) return json({ error: "Call offer is invalid." }, 400);

    const { data: tokens, error: tokenError } = await admin
      .from("htc_device_tokens")
      .select("fcm_token")
      .eq("user_id", signal.recipient_id);
    if (tokenError) throw tokenError;
    if (!tokens?.length) return json({ ok: true, sent: 0, reason: "No registered recipient devices." });

    const serviceAccount = JSON.parse(serviceAccountRaw);
    if (serviceAccount.project_id !== projectId) {
      return json({ error: "Firebase project ID does not match service account." }, 500);
    }
    const accessToken = await getGoogleAccessToken(serviceAccount);
    let sent = 0;
    const failures: string[] = [];
    for (const row of tokens) {
      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: row.fcm_token,
            notification: {
              title: mode === "video" ? "Incoming video call" : "Incoming audio call",
              body: "Happy Time Connect",
            },
            data: {
              type: "incoming_call",
              conversationId: signal.conversation_id,
              callerId: signal.sender_id,
              callKey: String(callKey),
              mode,
            },
            android: {
              priority: "high",
              ttl: "45s",
              notification: { channel_id: "htc_calls", sound: "default" },
            },
          },
        }),
      });
      if (response.ok) sent++;
      else failures.push(await response.text());
    }
    return json({ ok: true, sent, failed: failures.length });
  } catch (error) {
    console.error("send-call-push:", error);
    return json({ error: error instanceof Error ? error.message : "Push delivery failed." }, 500);
  }
});
