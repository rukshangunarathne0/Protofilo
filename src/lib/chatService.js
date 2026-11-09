import { supabase } from './supabase';

export async function getMyProfile() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error('Please sign in again.');
  return {
    id: user.id,
    phone: user.user_metadata?.phone || '',
    displayName: user.user_metadata?.display_name || user.user_metadata?.phone || 'User',
    profileName: user.user_metadata?.profile_name || user.user_metadata?.display_name || user.user_metadata?.phone || 'User'
  };
}

export async function findUserByPhone(phone) {
  const { data, error } = await supabase.rpc('htc_find_user_by_phone', { p_phone: phone });
  if (error) throw error;
  return data?.[0] || null;
}

export async function listMyConversations() {
  const me = await getMyProfile();
  const { data: memberships, error: memberError } = await supabase
    .from('htc_conversation_members')
    .select('conversation_id, member_role, htc_conversations(id,kind,title,created_by,created_at)')
    .eq('user_id', me.id);
  if (memberError) throw memberError;
  const conversations = (memberships || []).map(row => ({
    ...row.htc_conversations,
    memberRole: row.member_role
  })).filter(Boolean);
  if (!conversations.length) return [];
  const ids = conversations.map(c => c.id);
  const { data: members, error: membersError } = await supabase
    .from('htc_conversation_members')
    .select('conversation_id,user_id,member_role')
    .in('conversation_id', ids);
  if (membersError) throw membersError;
  const { data: messages, error: messagesError } = await supabase
    .from('htc_messages')
    .select('conversation_id,body,created_at,sender_id')
    .in('conversation_id', ids)
    .order('created_at', { ascending: false });
  if (messagesError) throw messagesError;
  return conversations.map(c => ({
    ...c,
    members: (members || []).filter(m => m.conversation_id === c.id),
    lastMessage: (messages || []).find(m => m.conversation_id === c.id) || null
  })).sort((a,b) => new Date(b.lastMessage?.created_at || b.created_at) - new Date(a.lastMessage?.created_at || a.created_at));
}

export async function createConversation({ kind, title = '', memberIds = [] }) {
  const me = await getMyProfile();
  // Create the conversation and its owner membership atomically through a
  // SECURITY DEFINER RPC, avoiding client-side RLS policy conflicts.
  const { data: conversation, error } = await supabase.rpc('htc_create_conversation', {
    p_kind: kind,
    p_title: title || null
  });
  if (error) throw error;
  const uniqueIds = [...new Set([me.id, ...memberIds])];
  for (const userId of uniqueIds.filter(id => id !== me.id)) {
    const { error: addError } = await supabase.rpc('htc_add_conversation_member', {
      p_conversation_id: conversation.id, p_user_id: userId, p_role: 'member'
    });
    if (addError) throw addError;
  }
  return conversation;
}

export async function fetchMessages(conversationId) {
  const { data, error } = await supabase.from('htc_messages')
    .select('id,conversation_id,sender_id,body,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendMessage(conversationId, body) {
  const me = await getMyProfile();
  const { data, error } = await supabase.from('htc_messages')
    .insert({ conversation_id: conversationId, sender_id: me.id, body: body.trim() })
    .select('id,conversation_id,sender_id,body,created_at')
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToMessages(conversationId, onMessage) {
  return supabase.channel('htc-messages-' + conversationId)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'htc_messages',
      filter: 'conversation_id=eq.' + conversationId
    }, payload => onMessage(payload.new))
    .subscribe();
}


export async function addConversationMember(conversationId, userId) {
  const { data, error } = await supabase.rpc('htc_add_conversation_member', {
    p_conversation_id: conversationId,
    p_user_id: userId,
    p_role: 'member'
  });
  if (error) throw error;
  return data;
}
