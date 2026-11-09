import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { getMyProfile, findUserByPhone, listMyConversations, createConversation, addConversationMember, fetchMessages, sendMessage, subscribeToMessages } from './lib/chatService';
import { saveLocalFile, listLocalFiles, deleteLocalFile, getLocalFileBlob, VAULT_CATEGORIES, isNativeVault, listenForChatDownloads } from './lib/localVault';
import { MessageCircle, Users, Phone, Video, LockKeyhole, Folder, Settings, Search, Plus, Send, Paperclip, Mic, ShieldCheck, Cloud, Smartphone, Menu, Palette, Check, RotateCcw, QrCode, Contact, UserPlus, Camera, X, Bell, User, LogOut, Shield, CircleDot, Save, ImagePlus } from 'lucide-react';
import QRCode from 'qrcode';

const initialChats = [
  { name: 'Pusti Consumer Team', message: 'আজকের মিটিংয়ের সময় জানানো হবে।', time: '10:42', unread: 3, group: true, color: 'mint' },
  { name: 'Sales Coordination', message: 'রিপোর্টটি শেয়ার করেছি।', time: '09:18', unread: 1, group: true, color: 'blue' },
  { name: 'Personal Chat', message: 'আপনার মেসেজ এখানে দেখা যাবে।', time: 'গতকাল', unread: 0, group: false, color: 'orange' },
];

const tabs = [
  { id: 'chats', label: 'চ্যাট', icon: MessageCircle },
  { id: 'groups', label: 'গ্রুপ', icon: Users },
  { id: 'calls', label: 'কল', icon: Phone },
  { id: 'storage', label: 'স্টোরেজ', icon: Folder },
  { id: 'private', label: 'প্রাইভেট', icon: LockKeyhole },
  { id: 'settings', label: 'থিম ও সেটিংস', icon: Palette },
];

const themeNames = ['Aurora','Ocean','Sunset','Galaxy','Forest','Midnight','Coral','Lavender','Arctic','Desert','Neon City','Deep Space','Emerald','Rose Gold','Blue Lagoon','Volcano','Jade','Sapphire','Amethyst','Pearl','Tropical','Monsoon','Dusk','Dawn','Cyber','Royal','Mint','Berry','Citrus','Glacier','Moonlight','Starlight','Rainforest','Cherry','Amber','Indigo','Turquoise','Obsidian','Opal','Flamingo','Seaside','Northern Lights','Cosmic Dust','Misty Mountain','Golden Hour','Lotus','Peacock','Cobalt','Pastel Dream','Prism'];
const palettes = [
 ['#071a24','#0b5960','#38e0b2'],['#061b35','#126c9b','#57d8f5'],['#32152d','#b64e58','#ffb36b'],['#100d36','#4a35a5','#c084fc'],['#092b25','#176b50','#9be7a5'],
 ['#080e1b','#26344e','#8ca7d8'],['#351a26','#a83f62','#ff9eaa'],['#211532','#7056a8','#d6b4ff'],['#102a3a','#3e8caa','#b5f2ff'],['#3a2416','#9a6338','#f4c27a']
];
const themes = Array.from({length:50},(_,i)=>({id:i,name:themeNames[i],colors:palettes[i%palettes.length],variant:i%5}));
const colorChoices = Array.from({length:120},(_,i)=>`hsl(${Math.round(i*3)} 78% ${[42,50,58,66][Math.floor(i/30)]}%)`);


function StoragePanel({ lang }) {
  const tr = (bn, en) => lang === 'bn' ? bn : en;
  const [category, setCategory] = useState('downloads');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const native = isNativeVault();
  async function refresh() {
    try { setFiles(await listLocalFiles()); }
    catch (e) { setError(e.message || 'Storage could not be read'); }
  }
  useEffect(() => { refresh(); }, []);
  async function handleFiles(event) {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    setBusy(true); setError(''); setMessage('');
    try {
      for (const file of selected) await saveLocalFile(file, category);
      await refresh();
      setMessage(tr('ফাইল ফোনের লোকাল স্টোরেজে সেভ হয়েছে।','Files saved to local storage.'));
    } catch (e) {
      setError(e.message || tr('ফাইল সেভ করা যায়নি।','Could not save file.'));
    } finally {
      setBusy(false); event.target.value = '';
    }
  }
  async function downloadFile(record) {
    try {
      const blob = await getLocalFileBlob(record);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = record.name; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) { setError(e.message); }
  }
  async function removeFile(record) {
    if (!window.confirm(tr('এই ফাইলটি ফোনের স্টোরেজ থেকে মুছে ফেলবেন?','Delete this file from local storage?'))) return;
    try { await deleteLocalFile(record); await refresh(); }
    catch (e) { setError(e.message); }
  }
  const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
  const formatSize = (bytes) => bytes < 1024*1024 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1024/1024).toFixed(1)} MB`;
  return <section className="storage-page">
    <div className="storage-intro panel-card">
      <div className="storage-drive-icon"><Smartphone size={29}/></div>
      <div><h2>{tr('ফোনের নিজস্ব স্টোরেজ','On-device storage')}</h2>
      <p>{native ? tr('ফাইল Android ফোনের Documents/Happy Time Connect ফোল্ডারে রাখা হবে।','Files are saved in Documents/Happy Time Connect on this Android device.') : tr('এটি এখন ব্রাউজারের লোকাল স্টোরেজে সেভ করছে। Android অ্যাপ ইনস্টল হলে নির্দিষ্ট ফোন ফোল্ডারে সেভ হবে।','Files are currently saved in browser-local storage. Install the Android app to save into the dedicated phone folder.')}</p></div>
      <span className="local-only-badge"><span/> {tr('লোকাল সেভ','LOCAL SAVE')}</span>
    </div>
    <div className="storage-folders panel-card">
      <div className="theme-section-head"><div><h2>{tr('আপনার ফোল্ডার সিস্টেম','Your folder system')}</h2><p>{tr('প্রতিটি ধরনের ফাইল আলাদা ফোল্ডারে থাকবে','Files are organized by type')}</p></div><span className="count-badge">7 FOLDERS</span></div>
      <div className="vault-folder-grid">{VAULT_CATEGORIES.map((item, index) => {
        const count = files.filter(file => file.category === item.id).length;
        return <button key={item.id} className={category===item.id?'vault-folder selected':'vault-folder'} onClick={()=>setCategory(item.id)}>
          <span className={`vault-folder-icon folder-tone-${index}`}><Folder size={21}/></span>
          <span><b>{tr(item.bn,item.en)}</b><small>{count} {tr('টি ফাইল','files')}</small></span>
        </button>;
      })}</div>
    </div>
    <div className="storage-upload panel-card">
      <div><h2>{tr('ফোনে ফাইল সেভ করুন','Save files to this device')}</h2><p>{tr('ফোল্ডার নির্বাচন করে ছবি, ভিডিও, ডকুমেন্ট বা অডিও যোগ করুন।','Choose a folder and add photos, videos, documents or audio.')}</p></div>
      <label className="vault-category-select"><span>{tr('সেভ করার ফোল্ডার','Save to folder')}</span><select value={category} onChange={e=>setCategory(e.target.value)}>{VAULT_CATEGORIES.map(item=><option key={item.id} value={item.id}>{tr(item.bn,item.en)}</option>)}</select></label>
      <label className="vault-upload-button"><Plus size={18}/>{busy?tr('সেভ হচ্ছে...','Saving...'):tr('ফোন থেকে ফাইল নির্বাচন করুন','Choose files from phone')}<input type="file" multiple onChange={handleFiles} disabled={busy}/></label>
      {message&&<div className="vault-success">{message}</div>}{error&&<div className="vault-error">{error}</div>}
    </div>
    <div className="storage-files panel-card">
      <div className="theme-section-head"><div><h2>{tr('সেভ করা ফাইল','Saved files')}</h2><p>{tr('এই ডিভাইসে সংরক্ষিত ফাইলের তালিকা','Files stored on this device')}</p></div><span className="count-badge">{files.length} FILES · {formatSize(totalBytes)}</span></div>
      {files.length===0?<div className="vault-empty"><Folder size={30}/><b>{tr('এখনো কোনো ফাইল সেভ হয়নি','No files saved yet')}</b><span>{tr('প্রথম ফাইলটি যোগ করতে উপরের বাটনে চাপ দিন।','Use the button above to add your first file.')}</span></div>:
      <div className="vault-file-list">{files.map(file=><div className="vault-file-row" key={file.id}><span className="vault-file-icon"><Folder size={18}/></span><span className="vault-file-info"><b>{file.name}</b><small>{tr(VAULT_CATEGORIES.find(c=>c.id===file.category)?.bn||'Downloads',VAULT_CATEGORIES.find(c=>c.id===file.category)?.en||'Downloads')} · {formatSize(file.size)} · {new Date(file.savedAt).toLocaleDateString()}</small></span><button onClick={()=>downloadFile(file)}>{tr('খুলুন','Open')}</button><button className="vault-delete" onClick={()=>removeFile(file)}>{tr('মুছুন','Delete')}</button></div>)}</div>}
    </div>
    <div className="vault-note"><ShieldCheck size={17}/><span>{tr('ফাইলের ক্লাউড স্টোরেজ ব্যবহার করা হচ্ছে না। চ্যাট ও অ্যাকাউন্ট চালাতে সার্ভার সংযোগ থাকবে। নতুন ইনকামিং চ্যাট অ্যাটাচমেন্টের অটো-সেভ পরবর্তী ধাপে যুক্ত হবে।','Cloud file storage is not used here. Server connectivity remains for accounts and messaging. Automatic saving of incoming chat attachments will be connected in the next step.')}</span></div>
  </section>;
}



function CallCenter({ lang, myProfile, conversations }) {
  const tr=(bn,en)=>lang==='bn'?bn:en;
  const [phone,setPhone]=useState('');
  const [localConversations,setLocalConversations]=useState(conversations);
  const [targetId,setTargetId]=useState('');
  const [mode,setMode]=useState('audio');
  const [status,setStatus]=useState('idle');
  const [incoming,setIncoming]=useState(null);
  const [notice,setNotice]=useState('');
  const [muted,setMuted]=useState(false);
  const [cameraOn,setCameraOn]=useState(true);
  const [seconds,setSeconds]=useState(0);
  const [searching,setSearching]=useState(false);
  const pcRef=useRef(null), localRef=useRef(null), remoteRef=useRef(null), localVideoRef=useRef(null), callRef=useRef(null), queuedIceRef=useRef([]);
  useEffect(()=>{setLocalConversations(conversations);},[conversations]);
  const privateChats=localConversations.filter(c=>c.kind==='private'&&c.members?.some(m=>m.user_id!==myProfile?.id));
  const selected=privateChats.find(c=>c.id===targetId);
  const peerId=selected?.members?.find(m=>m.user_id!==myProfile?.id)?.user_id;
  function normalizedDialNumber(value){
    const digits=value.replace(/\D/g,'');
    if(value.trim().startsWith('+')) return '+'+digits;
    if(digits.length===11&&digits.startsWith('0')) return '+880'+digits.slice(1);
    if(digits.length===13&&digits.startsWith('880')) return '+'+digits;
    if(digits.length>=7&&digits.length<=15) return '+'+digits;
    throw new Error('সঠিক দেশের কোডসহ মোবাইল নম্বর লিখুন।');
  }
  async function findOrCreateChat(){
    setNotice('');
    let fullPhone;
    try{fullPhone=normalizedDialNumber(phone);}catch(e){setNotice(e.message);return;}
    setSearching(true);
    try{
      const user=await findUserByPhone(fullPhone);
      if(!user){setNotice('এই নম্বরে Happy Time Connect-এ নিবন্ধিত ব্যবহারকারী পাওয়া যায়নি।');return;}
      if(user.user_id===myProfile.id){setNotice('নিজের নম্বরে কল করা যাবে না।');return;}
      let chat=privateChats.find(c=>c.members?.some(m=>m.user_id===user.user_id));
      if(!chat){
        const created=await createConversation({kind:'private',title:user.display_name||user.phone||fullPhone,memberIds:[user.user_id]});
        chat={...created,members:[{user_id:myProfile.id},{user_id:user.user_id}]};
        setLocalConversations(prev=>[chat,...prev]);
      }
      setTargetId(chat.id);
      setNotice((user.display_name||user.phone||fullPhone)+' — কল করার জন্য প্রস্তুত।');
    }catch(e){setNotice(e.message||'ব্যবহারকারী খোঁজা যায়নি।');}
    finally{setSearching(false);}
  }
  async function cleanup(next='idle'){
    try{pcRef.current?.close();}catch{}
    pcRef.current=null;localRef.current?.getTracks().forEach(t=>t.stop());localRef.current=null;
    if(remoteRef.current)remoteRef.current.srcObject=null;
    if(localVideoRef.current)localVideoRef.current.srcObject=null;
    callRef.current=null;queuedIceRef.current=[];setIncoming(null);setStatus(next);setSeconds(0);
  }
  async function makePeer(conversationId,recipientId,callKey,callMode){
    const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
    pcRef.current=pc;callRef.current={conversationId,recipientId,callKey};
    pc.ontrack=e=>{if(remoteRef.current)remoteRef.current.srcObject=e.streams[0];};
    pc.onicecandidate=e=>{if(e.candidate)supabase.from('htc_call_signals').insert({conversation_id:conversationId,sender_id:myProfile.id,recipient_id:recipientId,signal_type:'ice-candidate',payload:{callKey,candidate:e.candidate.toJSON()}}).then(({error})=>{if(error)setNotice(error.message);});};
    pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed')setNotice(tr('নেটওয়ার্ক সংযোগ ব্যর্থ হয়েছে।','Network connection failed.'));};
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:callMode==='video'});
    localRef.current=stream;stream.getTracks().forEach(track=>pc.addTrack(track,stream));
    if(localVideoRef.current){localVideoRef.current.srcObject=stream;localVideoRef.current.play().catch(()=>{});}
    return pc;
  }
  async function startCall(callMode){
    if(!selected||!peerId)return;
    try{setNotice('');setMode(callMode);setStatus('calling');const key=crypto.randomUUID();const pc=await makePeer(selected.id,peerId,key,callMode);const offer=await pc.createOffer();await pc.setLocalDescription(offer);
      const {data:offerSignal,error}=await supabase.from('htc_call_signals').insert({conversation_id:selected.id,sender_id:myProfile.id,recipient_id:peerId,signal_type:'offer',payload:{callKey:key,sdp:offer,mode:callMode}}).select('id').single();
      if(error)throw error;
      // Ask the trusted Edge Function to notify the recipient's registered Android devices.
      // The function verifies the signed-in caller and the stored offer before sending FCM.
      const {error:pushError}=await supabase.functions.invoke('send-call-push',{body:{callSignalId:offerSignal.id}});
      if(pushError)console.warn('Call push notification could not be sent:',pushError.message);
    }catch(error){await cleanup();setNotice(error.message||tr('কল শুরু করা যায়নি','Could not start call'));}
  }
  async function acceptCall(){
    if(!incoming)return;
    try{setMode(incoming.mode||'audio');setStatus('connecting');const pc=await makePeer(incoming.conversation_id,incoming.sender_id,incoming.callKey,incoming.mode||'audio');await pc.setRemoteDescription(new RTCSessionDescription(incoming.sdp));
      for(const candidate of queuedIceRef.current)await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(()=>{});queuedIceRef.current=[];
      const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
      const {error}=await supabase.from('htc_call_signals').insert({conversation_id:incoming.conversation_id,sender_id:myProfile.id,recipient_id:incoming.sender_id,signal_type:'answer',payload:{callKey:incoming.callKey,sdp:answer}});
      if(error)throw error;setIncoming(null);setStatus('active');
    }catch(error){await cleanup();setNotice(error.message||'Could not answer call');}
  }
  async function handleSignal(row){
    const p=row.payload||{};
    if(row.signal_type==='offer'&&row.recipient_id===myProfile.id&&!callRef.current){setIncoming({...row,...p,peerName:'Incoming call'});setStatus('ringing');}
    else if(row.signal_type==='answer'&&row.recipient_id===myProfile.id&&callRef.current?.callKey===p.callKey&&pcRef.current){await pcRef.current.setRemoteDescription(new RTCSessionDescription(p.sdp)).catch(()=>{});setStatus('active');}
    else if(row.signal_type==='ice-candidate'&&row.recipient_id===myProfile.id&&callRef.current?.callKey===p.callKey&&pcRef.current){if(pcRef.current.remoteDescription)await pcRef.current.addIceCandidate(new RTCIceCandidate(p.candidate)).catch(()=>{});else queuedIceRef.current.push(p.candidate);}
    else if(['reject','hangup'].includes(row.signal_type)&&row.recipient_id===myProfile.id&&callRef.current?.callKey===p.callKey){await cleanup('ended');setNotice(tr('অপর পক্ষ কল শেষ করেছেন।','The other person ended the call.'));}
  }
  useEffect(()=>{
    if(!myProfile?.id)return;
    const channel=supabase.channel('htc-call-inbox-'+myProfile.id)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'htc_call_signals'},payload=>{
        const row=payload.new;
        if(row?.recipient_id===myProfile.id||row?.sender_id===myProfile.id){
          console.log('[HTC CALL] Participant signal received:',row?.signal_type,row?.id,'recipient:',row?.recipient_id);
          handleSignal(row);
        }
      })
      .subscribe((status,error)=>{
        console.log('[HTC CALL] Realtime subscription:',status,error||'');
        if(status==='SUBSCRIBED'){
          setNotice('কল নেটওয়ার্ক প্রস্তুত। এখন কল করা যাবে।');
        }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
          setNotice('কলের Realtime সংযোগ ব্যর্থ: '+status+(error?.message?' — '+error.message:''));
        }
      });
    return()=>{supabase.removeChannel(channel);cleanup();};
  },[myProfile?.id]);
  useEffect(()=>{if(status!=='active')return;const id=setInterval(()=>setSeconds(s=>s+1),1000);return()=>clearInterval(id);},[status]);
  async function endCall(reject=false){
    const call=callRef.current||incoming;
    if(call)await supabase.from('htc_call_signals').insert({conversation_id:call.conversationId||call.conversation_id,sender_id:myProfile.id,recipient_id:call.recipientId||call.sender_id,signal_type:reject?'reject':'hangup',payload:{callKey:call.callKey}});
    await cleanup('ended');
  }
  function toggleMute(){const next=!muted;localRef.current?.getAudioTracks().forEach(t=>t.enabled=!next);setMuted(next);}
  function toggleCamera(){const next=!cameraOn;localRef.current?.getVideoTracks().forEach(t=>t.enabled=next);setCameraOn(next);}
  function pressDigit(d){setPhone(v=>(v+d).slice(0,18));}
  const fmt=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  return <div className="panel-card" style={{padding:18,display:'grid',gap:14}}>
    <h3>{tr('অডিও ও ভিডিও কল','Audio & Video Calls')}</h3>
    <div style={{display:'grid',gap:8}}>
      <label>{tr('মোবাইল নম্বর লিখুন','Enter mobile number')}</label>
      <input value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9+ ]/g,'').slice(0,18))} placeholder="01XXXXXXXXX / +8801XXXXXXXXX" inputMode="tel" style={{padding:14,borderRadius:10,fontSize:18}}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,maxWidth:340,margin:'0 auto',width:'100%'}}>
        {['1','2','3','4','5','6','7','8','9','*','0','#'].map(d=><button type="button" key={d} onClick={()=>pressDigit(d)} style={{padding:13,borderRadius:12,fontSize:20}}>{d}</button>)}
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
        <button type="button" onClick={()=>setPhone(v=>v.slice(0,-1))}>{tr('এক অঙ্ক মুছুন','Backspace')}</button>
        <button type="button" onClick={()=>setPhone('')}>{tr('মুছুন','Clear')}</button>
        <button type="button" className="feature-primary" disabled={searching||!phone.trim()} onClick={findOrCreateChat}>{searching?tr('খোঁজা হচ্ছে...','Searching...'):tr('নম্বর খুঁজুন','Find number')}</button>
      </div>
    </div>
    {selected&&<div className="feature-notice">{tr('নির্বাচিত ব্যবহারকারী','Selected user')}: {selected.title||selected.members?.find(m=>m.user_id!==myProfile?.id)?.user_id}</div>}
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button className="feature-primary" disabled={!peerId||status==='calling'||status==='active'} onClick={()=>startCall('audio')}><Phone size={17}/> {tr('অডিও কল','Audio call')}</button><button className="feature-primary" disabled={!peerId||status==='calling'||status==='active'} onClick={()=>startCall('video')}><Video size={17}/> {tr('ভিডিও কল','Video call')}</button></div>
    {incoming&&<div className="feature-notice"><b>{tr('ইনকামিং কল','Incoming call')}</b><div style={{display:'flex',gap:8,marginTop:10}}><button className="feature-primary" onClick={acceptCall}>{tr('রিসিভ','Accept')}</button><button onClick={()=>endCall(true)}>{tr('রিজেক্ট','Reject')}</button></div></div>}
    {status!=='idle'&&<div style={{display:'grid',gap:10}}><b>{status==='active'?tr('কল চলছে','Call connected')+' · '+fmt:status==='ringing'?tr('কল আসছে','Incoming call'):status==='calling'?tr('কল করা হচ্ছে...','Calling...'):status==='ended'?tr('কল শেষ','Call ended'):tr('সংযোগ হচ্ছে...','Connecting...')}</b><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><video ref={localVideoRef} autoPlay muted playsInline style={{width:'100%',background:'#111',borderRadius:10}}/><video ref={remoteRef} autoPlay playsInline style={{width:'100%',background:'#111',borderRadius:10}}/></div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={toggleMute}>{muted?tr('মাইক চালু','Unmute'):tr('মাইক বন্ধ','Mute')}</button>{mode==='video'&&<button onClick={toggleCamera}>{cameraOn?tr('ক্যামেরা বন্ধ','Camera off'):tr('ক্যামেরা চালু','Camera on')}</button>}<button onClick={()=>endCall(false)}>{tr('কল কেটে দিন','Hang up')}</button></div></div>}
    {notice&&<div className="feature-notice">{notice}</div>}
    <small>{tr('ক্যামেরা ও মাইক্রোফোনের অনুমতি চাইবে। উভয় ব্যবহারকারীকে অনলাইনে থাকতে হবে; কিছু নেটওয়ার্কে অতিরিক্ত TURN সার্ভার প্রয়োজন হতে পারে।','Camera and microphone permission will be requested. Both users need to be online; some networks may require a TURN server.')}</small>
  </div>;
}

function FeatureWorkspace({ active, lang, groups = [], myProfile, conversations = [], onCreateGroup, onOpenGroup, onAddGroupMembers }) {
  const tr = (bn,en) => lang === 'bn' ? bn : en;
  const [groupPhones,setGroupPhones] = useState('');
  const [groupName,setGroupName] = useState('');
  const [showCreate,setShowCreate] = useState(false);
  const [notice,setNotice] = useState('');
  const [secret,setSecret] = useState('');
  const [unlocked,setUnlocked] = useState(false);
  const [search,setSearch] = useState('');
  const [memberGroup,setMemberGroup] = useState(null);
  const [memberMode,setMemberMode] = useState('manual');
  const [memberPhones,setMemberPhones] = useState('');
  const [pendingInvitePhones,setPendingInvitePhones] = useState('');
  const [memberBusy,setMemberBusy] = useState(false);
  const [qrData,setQrData] = useState('');
  const [showMyQr,setShowMyQr] = useState(false);
  const [myQr,setMyQr] = useState('');
  const [scannerOn,setScannerOn] = useState(false);
  const [scannerError,setScannerError] = useState('');
  const videoRef = useRef(null);
  const scanStreamRef = useRef(null);
  const isGroups = active === 'groups';
  const isCalls = active === 'calls';
  useEffect(() => {
    if (!showMyQr || !myProfile?.phone) return;
    QRCode.toDataURL('HTCUSER:' + myProfile.phone, { width: 260, margin: 2 }).then(setMyQr).catch(() => setMyQr(''));
  }, [showMyQr, myProfile?.phone]);
  useEffect(() => {
    if (!scannerOn) return;
    let active = true;
    let detector;
    let timer;
    async function start() {
      try {
        if (!('BarcodeDetector' in window)) throw new Error(tr('এই ফোনের ব্রাউজারে QR স্ক্যান সমর্থিত নয়।','QR scanning is not supported by this phone browser.'));
        detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
        scanStreamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        timer = window.setInterval(async () => {
          if (!active || !videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) {
              const raw = codes[0].rawValue || '';
              const phone = raw.startsWith('HTCUSER:') ? raw.slice(8) : raw;
              if (/^\\+?[0-9]{7,15}$/.test(phone.replace(/[\\s()-]/g,''))) {
                setMemberPhones(phone.replace(/[\\s()-]/g,''));
                setMemberMode('manual');
                setScannerOn(false);
                setNotice(tr('QR কোড পাওয়া গেছে। এখন সদস্য যোগ করুন চাপুন।','QR found. Now tap Add member.'));
              } else setScannerError(tr('QR কোডটি Happy Time Connect ব্যবহারকারীর নয়।','This QR code is not a Happy Time Connect user code.'));
            }
          } catch {}
        }, 450);
      } catch (error) { setScannerError(error.message || 'Camera could not start.'); }
    }
    start();
    return () => { active = false; if (timer) clearInterval(timer); scanStreamRef.current?.getTracks().forEach(track => track.stop()); scanStreamRef.current = null; };
  }, [scannerOn]);
  async function pickContacts() {
    try {
      if (!('contacts' in navigator) || !('select' in navigator.contacts)) throw new Error(tr('এই ডিভাইসে Contacts Picker নেই। নিচে ফোন নম্বর লিখুন।','Contacts picker is unavailable on this device. Enter a phone number below.'));
      const contacts = await navigator.contacts.select(['name','tel'], { multiple: true });
      const numbers = contacts.flatMap(contact => contact.tel || []).map(value => value.trim()).filter(Boolean);
      if (!numbers.length) throw new Error(tr('নির্বাচিত Contacts-এ ফোন নম্বর নেই।','Selected contacts have no phone numbers.'));
      setMemberPhones(numbers.join(', '));
      setMemberMode('manual');
      setNotice(tr('Contacts থেকে নম্বর নেওয়া হয়েছে। এখন সদস্য যোগ করুন।','Numbers imported from Contacts. Tap Add member.'));
    } catch (error) { setNotice(error.message || 'Could not read contacts.'); }
  }
  async function submitMemberAdd() {
    if (!memberGroup || !memberPhones.trim()) return;
    setMemberBusy(true);
    try {
      const result = await onAddGroupMembers(memberGroup, memberPhones);
      if (result?.unregistered?.length) {
        setPendingInvitePhones(result.unregistered.join(', '));
        setNotice(tr('কিছু নম্বর এখনো নিবন্ধিত নয়। তাদের আমন্ত্রণ পাঠান।','Some numbers are not registered yet. Send them an invitation.'));
      } else {
        setNotice(tr('সদস্য সফলভাবে যোগ হয়েছে।','Member added successfully.'));
        setMemberGroup(null); setMemberPhones(''); setScannerOn(false);
      }
    } catch (error) { setNotice(error.message || 'Could not add member.'); }
    finally { setMemberBusy(false); }
  }
  async function sendPendingInvites() {
    const numbers = pendingInvitePhones.split(',').map(v=>v.trim()).filter(Boolean);
    if (!numbers.length) return;
    const inviteText = tr('আমি Happy Time Connect ব্যবহার করছি। আপনিও অ্যাপটিতে নিবন্ধন করে আমার সাথে যুক্ত হন: ','I am using Happy Time Connect. Register in the app and connect with me: ') + window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title:'Happy Time Connect', text:inviteText, url:window.location.origin });
      else window.location.href = 'sms:' + numbers.join(',') + '?body=' + encodeURIComponent(inviteText);
      setPendingInvitePhones('');
      setNotice(tr('আমন্ত্রণ পাঠানোর জন্য শেয়ার অপশন খোলা হয়েছে।','Share opened so you can send the invitation.'));
    } catch (error) { if (error.name !== 'AbortError') setNotice(error.message || 'Could not open sharing.'); }
  }
  const title = isGroups ? tr('আপনার গ্রুপসমূহ','Your Groups') : isCalls ? tr('কল ও মিটিং','Calls & Meetings') : tr('প্রাইভেট চ্যাট','Private Chat');
  const subtitle = isGroups ? tr('পরিবার, বন্ধু ও কাজের দলের জন্য আলাদা জায়গা','A space for family, friends and teams') : isCalls ? tr('অডিও ও ভিডিও যোগাযোগের কেন্দ্র','Your audio and video communication hub') : tr('গোপন কোড দিয়ে সুরক্ষিত ব্যক্তিগত জায়গা','A protected space with a secret code');
  return <section className="feature-workspace">
    <div className="feature-hero panel-card">
      <div className="feature-hero-copy"><span className="feature-kicker">HAPPY TIME CONNECT</span><h2>{title}</h2><p>{subtitle}</p></div>
      <div className="feature-hero-art">{isGroups?<Users size={54}/>:isCalls?<Video size={54}/>:<LockKeyhole size={54}/>}</div>
    </div>
    {isGroups && <>
      <div className="feature-toolbar"><div><h3>{tr('গ্রুপ তালিকা','Group list')}</h3><p>{tr('আপনার তৈরি করা গ্রুপগুলো','Groups you create')}</p></div><button className="feature-primary" onClick={()=>setShowCreate(v=>!v)}><Plus size={17}/>{tr('নতুন গ্রুপ','New group')}</button></div>
      {showCreate && <form className="feature-create panel-card" onSubmit={async e=>{e.preventDefault();if(!groupName.trim())return;try{const result=await onCreateGroup(groupName.trim(),groupPhones);setGroupName('');setGroupPhones('');setShowCreate(false);if(result?.unregistered?.length){setPendingInvitePhones(result.unregistered.join(', '));setNotice(tr('গ্রুপ তৈরি হয়েছে। কিছু নম্বর এখনো নিবন্ধিত নয়—তাদের আমন্ত্রণ পাঠান।','Group created. Some numbers are not registered yet—invite them to join.'));}else setNotice(tr('গ্রুপ তৈরি হয়েছে। এখন চ্যাট ট্যাবে মেসেজ পাঠাতে পারবেন।','Group created. You can now message in the Chats tab.'));}catch(error){setNotice(error.message||'Could not create group.');}}}><input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder={tr('গ্রুপের নাম লিখুন','Enter group name')} maxLength={40}/><input value={groupPhones} onChange={e=>setGroupPhones(e.target.value)} placeholder={tr('সদস্যদের ফোন নম্বর, কমা দিয়ে আলাদা করুন (+880...)','Member phone numbers, comma separated (+880...)')}/><button className="feature-primary" type="submit">{tr('গ্রুপ তৈরি করুন','Create group')}</button></form>}
      <div className="feature-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tr('গ্রুপ খুঁজুন','Search groups')}/></div>
      <div className="feature-card-grid">{groups.filter(g=>(g.title||'').toLowerCase().includes(search.toLowerCase())).map((g,i)=><article className="feature-item panel-card" key={g.id}><div className={'feature-item-icon '+(i%2?'blue':'mint')}><Users size={23}/></div><div className="feature-item-title"><h3>{g.title||'Group'}</h3><span>{g.members?.length||1} {tr('জন সদস্য','members')}</span></div><p>{g.lastMessage?.body||tr('এখনো কোনো মেসেজ নেই','No messages yet')}</p><button onClick={()=>onOpenGroup(g)}>{tr('গ্রুপ খুলুন','Open group')} <span>→</span></button><button onClick={()=>{setMemberGroup(g);setMemberPhones('');setMemberMode('manual');setScannerError('');setScannerOn(false);}}><UserPlus size={15}/> {tr('সদস্য যোগ','Add members')}</button></article>)}</div>
      {!groups.length&&<div className="feature-notice">{tr('এখনো কোনো গ্রুপ নেই। নতুন গ্রুপ তৈরি করুন।','No groups yet. Create your first group.')}</div>}
      {memberGroup && <div className="member-modal-backdrop" role="dialog" aria-modal="true">
        <div className="member-modal panel-card">
          <div className="member-modal-head"><div><span className="feature-kicker">GROUP MEMBERS</span><h3>{tr('সদস্য যোগ করুন','Add group members')}</h3><p>{memberGroup.title}</p></div><button className="icon-btn" onClick={()=>{setMemberGroup(null);setScannerOn(false);}} aria-label="Close"><X size={20}/></button></div>
          <div className="member-methods">
            <button className={memberMode==='manual'?'active':''} onClick={()=>{setMemberMode('manual');setScannerOn(false);}}><UserPlus size={18}/>{tr('নম্বর লিখুন','Enter number')}</button>
            <button onClick={pickContacts}><Contact size={18}/>{tr('Contacts','Contacts')}</button>
            <button className={memberMode==='qr'?'active':''} onClick={()=>{setMemberMode('qr');setScannerError('');setScannerOn(true);}}><QrCode size={18}/>{tr('QR স্ক্যান','Scan QR')}</button>
          </div>
          {memberMode==='qr' && <div className="qr-scan-box"><video ref={videoRef} playsInline muted/><p>{tr('অন্য সদস্যের Happy Time Connect QR কোড ক্যামেরার সামনে ধরুন।','Point the camera at another member’s Happy Time Connect QR code.')}</p>{scannerError&&<div className="vault-error">{scannerError}</div>}</div>}
          <label className="member-number-label">{tr('ফোন নম্বর','Phone number')}<input value={memberPhones} onChange={e=>setMemberPhones(e.target.value)} placeholder="+8801XXXXXXXXX" inputMode="tel"/></label>
          <small>{tr('একাধিক নম্বর হলে কমা দিয়ে আলাদা করুন। নিবন্ধিত সদস্য যুক্ত হবে; অনিবন্ধিত সদস্যকে আমন্ত্রণ পাঠাতে পারবেন।','Separate multiple numbers with commas. Registered members will be added; you can invite unregistered people.')}</small>
          <button className="feature-primary member-submit" disabled={!memberPhones.trim()||memberBusy} onClick={submitMemberAdd}>{memberBusy?tr('যোগ হচ্ছে...','Adding...'):tr('সদস্য যোগ করুন','Add member')}</button>
        </div>
      </div>}
      {showMyQr && <div className="member-modal-backdrop" role="dialog" aria-modal="true"><div className="member-modal panel-card my-qr-card"><button className="icon-btn qr-close" onClick={()=>setShowMyQr(false)}><X size={20}/></button><h3>{tr('আমার QR কোড','My QR code')}</h3><p>{tr('অন্যরা এই কোড স্ক্যান করে আপনার নম্বর দিয়ে গ্রুপে যোগ করতে পারবে।','Others can scan this code to add you to a group.')}</p>{myQr?<img src={myQr} alt="My Happy Time Connect QR"/>:<p>{tr('QR তৈরি হচ্ছে...','Generating QR...')}</p>}<small>{myProfile?.phone||''}</small></div></div>}
      <div className="my-qr-action"><button onClick={()=>setShowMyQr(true)}><QrCode size={16}/>{tr('আমার QR কোড দেখান','Show my QR code')}</button></div>
      {notice&&<div className="feature-notice">{notice}</div>}
      {pendingInvitePhones&&<div className="feature-notice"><button className="feature-primary" type="button" onClick={sendPendingInvites}>{tr('অনিবন্ধিত নম্বরে আমন্ত্রণ পাঠান','Invite unregistered numbers')}</button><button type="button" onClick={()=>setPendingInvitePhones('')}>{tr('এখন নয়','Not now')}</button></div>}
    </>}
    {isCalls && <CallCenter lang={lang} myProfile={myProfile} conversations={conversations}/>}
    {!isGroups&&!isCalls && <>
      <div className="private-layout"><div className="private-info panel-card"><div className="private-lock"><LockKeyhole size={34}/></div><h3>{tr('আপনার ব্যক্তিগত নিরাপদ জায়গা','Your private space')}</h3><p>{tr('প্রাইভেট চ্যাটের জন্য আলাদা গোপন কোডের ইন্টারফেস। আসল মেসেজ ও এনক্রিপশন চালুর আগে সার্ভার সুরক্ষা যুক্ত করতে হবে।','A separate secret-code interface for private chat. Server-side protection and encryption must be connected before real messages are enabled.')}</p><div className="private-badges"><span><ShieldCheck size={14}/> {tr('কোড প্রবেশ','Code access')}</span><span><LockKeyhole size={14}/> {tr('ব্যক্তিগত','Private')}</span></div></div><form className="private-unlock panel-card" onSubmit={e=>{e.preventDefault();setUnlocked(false);setNotice(tr('ইন্টারফেস প্রস্তুত, তবে নিরাপদ যাচাই সার্ভার এখনো সংযুক্ত নয়।','Interface is ready, but secure server verification is not connected yet.'));}}><span className="feature-kicker">PRIVATE ACCESS</span><h3>{tr('গোপন কোড দিন','Enter secret code')}</h3><p>{tr('আপনার প্রাইভেট চ্যাটে প্রবেশের কোড','Your private chat access code')}</p><input value={secret} onChange={e=>setSecret(e.target.value.slice(0,12))} type="password" placeholder={tr('গোপন কোড','Secret code')} maxLength={12}/><button className="feature-primary" disabled={!secret.trim()} type="submit"><LockKeyhole size={16}/>{tr('প্রবেশ করুন','Unlock')}</button>{notice&&<div className="feature-notice">{notice}</div>}</form></div>
    </>}
  </section>;
}

function MainApp({ lang, setLang }) {
  const tr = (bn, en) => lang === 'bn' ? bn : en;
  const [active,setActive] = useState('chats');
  const [query,setQuery] = useState('');
  const [message,setMessage] = useState('');
  const [myProfile,setMyProfile] = useState(null);
  const [conversations,setConversations] = useState([]);
  const [selectedConversation,setSelectedConversation] = useState(null);
  const [chatMessages,setChatMessages] = useState([]);
  const [chatBusy,setChatBusy] = useState(false);
  const [chatError,setChatError] = useState('');
  const [mobileMenu,setMobileMenu] = useState(false);
  const [accountMenuOpen,setAccountMenuOpen] = useState(false);
  const openAccountSettings = () => { setAccountSection('profile'); setAccountNotice(''); setAccountError(''); setAccountMenuOpen(true); };
  const [accountSection,setAccountSection] = useState('profile');
  const [profileName,setProfileName] = useState('');
  const [profileDisplayName,setProfileDisplayName] = useState('');
  const [profilePhoto,setProfilePhoto] = useState('');
  const [accountStatus,setAccountStatus] = useState(()=>localStorage.getItem('htc-account-status')||'online');
  const [notificationPrefs,setNotificationPrefs] = useState(()=>JSON.parse(localStorage.getItem('htc-notification-prefs')||'{"messages":true,"groups":true,"calls":true,"sound":true}'));
  const [accountNotice,setAccountNotice] = useState('');
  const [accountError,setAccountError] = useState('');
  const [newPassword,setNewPassword] = useState('');
  const [profileSaving,setProfileSaving] = useState(false);
  useEffect(()=>{if(myProfile?.id){setProfileName(myProfile.profileName||myProfile.displayName||'');setProfileDisplayName(myProfile.displayName||'');setProfilePhoto(localStorage.getItem('htc-profile-photo-'+myProfile.id)||'');}},[myProfile?.id]);
  useEffect(()=>{localStorage.setItem('htc-account-status',accountStatus);},[accountStatus]);
  useEffect(()=>{localStorage.setItem('htc-notification-prefs',JSON.stringify(notificationPrefs));},[notificationPrefs]);
  async function saveAccountProfile(){
    setProfileSaving(true);setAccountError('');setAccountNotice('');
    try{const {error}=await supabase.auth.updateUser({data:{display_name:profileDisplayName.trim()||profileName.trim(),profile_name:profileName.trim()}});if(error)throw error;
      setMyProfile(p=>({...p,displayName:profileDisplayName.trim()||profileName.trim(),profileName:profileName.trim()}));setAccountNotice(tr('প্রোফাইলের নাম সেভ হয়েছে।','Profile details saved.'));
    }catch(e){setAccountError(e.message||'Could not save profile.');}finally{setProfileSaving(false);}
  }
  function chooseProfilePhoto(event){
    const file=event.target.files?.[0];if(!file)return;
    if(!file.type.startsWith('image/')){setAccountError(tr('শুধু ছবি নির্বাচন করুন।','Please choose an image file.'));return;}
    if(file.size>2*1024*1024){setAccountError(tr('ছবির সাইজ ২ MB-এর কম হতে হবে।','Image must be smaller than 2 MB.'));return;}
    const reader=new FileReader();reader.onload=()=>{const value=String(reader.result||'');setProfilePhoto(value);if(myProfile?.id)localStorage.setItem('htc-profile-photo-'+myProfile.id,value);setAccountNotice(tr('এই ফোনে প্রোফাইল ছবি সেট হয়েছে।','Profile photo saved on this device.'));};reader.readAsDataURL(file);
  }
  async function changeAccountPassword(){
    setAccountError('');setAccountNotice('');
    if(!/^[A-Za-z0-9]{6}$/.test(newPassword)){setAccountError(tr('নতুন পাসওয়ার্ড ঠিক ৬ অক্ষরের হতে হবে।','New password must be exactly 6 characters.'));return;}
    const {error}=await supabase.auth.updateUser({password:newPassword});
    if(error)setAccountError(error.message);else{setNewPassword('');setAccountNotice(tr('পাসওয়ার্ড পরিবর্তন হয়েছে।','Password updated successfully.'));}
  }
  const [selectedTheme,setSelectedTheme] = useState(()=>Number(localStorage.getItem('htc-theme')||0));
  const [custom,setCustom] = useState(()=>JSON.parse(localStorage.getItem('htc-custom')||'null') || {background:'#071a24',surface:'#173b46',accent:'#38e0b2'});
  const [useCustom,setUseCustom] = useState(()=>localStorage.getItem('htc-use-custom')==='true');
  const title = ({chats:tr('চ্যাট','Chats'),groups:tr('গ্রুপ','Groups'),calls:tr('কল','Calls'),storage:tr('স্টোরেজ','Storage'),private:tr('প্রাইভেট','Private'),settings:tr('থিম ও সেটিংস','Themes & Settings')})[active] || tr('চ্যাট','Chats');
  const filtered = conversations.filter(c => {
    const other = c.members?.find(m => m.user_id !== myProfile?.id);
    const label = c.kind === 'group' ? (c.title || 'Group') : (other?.user_id || 'Private chat');
    return (label + (c.lastMessage?.body || '')).toLowerCase().includes(query.toLowerCase());
  });
  async function refreshConversations() {
    const [profile, rows] = await Promise.all([getMyProfile(), listMyConversations()]);
    setMyProfile(profile); setConversations(rows);
    setSelectedConversation(current => current && rows.some(row => row.id === current.id) ? rows.find(row => row.id === current.id) : (rows[0] || null));
  }
  useEffect(() => {
    let alive = true;
    refreshConversations().catch(error => { if (alive) setChatError(error.message || 'Chat service is not ready.'); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const openCalls = () => setActive('calls');
    window.addEventListener('htc:incoming-call-push', openCalls);
    return () => window.removeEventListener('htc:incoming-call-push', openCalls);
  }, []);

  // Keep the conversation list in sync when another member adds this user to a group.
  useEffect(() => {
    if (!myProfile?.id) return;
    const refresh = () => refreshConversations().catch(error => setChatError(error.message || 'Could not refresh conversations.'));
    const channel = supabase.channel('htc-membership-inbox-' + myProfile.id)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'htc_conversation_members',
        filter: 'user_id=eq.' + myProfile.id
      }, refresh)
      .subscribe();
    const timer = window.setInterval(refresh, 15000);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [myProfile?.id]);
  useEffect(() => {
    if (!selectedConversation) { setChatMessages([]); return; }
    let alive = true;
    fetchMessages(selectedConversation.id).then(rows => { if (alive) setChatMessages(rows); }).catch(error => { if (alive) setChatError(error.message); });
    const channel = subscribeToMessages(selectedConversation.id, row => {
      setChatMessages(current => current.some(item => item.id === row.id) ? current : [...current,row]);
      setConversations(current => current.map(c => c.id === row.conversation_id ? {...c,lastMessage:row} : c));
    });
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [selectedConversation?.id]);
  async function startPrivateChat() {
    const phone = window.prompt(tr('যার সাথে চ্যাট করবেন তার সম্পূর্ণ ফোন নম্বর লিখুন (+880...)','Enter the full phone number (+880...)'));
    if (!phone) return;
    setChatBusy(true); setChatError('');
    try {
      const person = await findUserByPhone(phone.trim());
      if (!person) throw new Error(tr('এই নম্বরে কোনো নিবন্ধিত ব্যবহারকারী পাওয়া যায়নি।','No registered user found with this phone number.'));
      const existing = conversations.find(c => c.kind === 'private' && c.members?.some(m => m.user_id === person.user_id));
      if (existing) setSelectedConversation(existing);
      else { const conversation = await createConversation({kind:'private',memberIds:[person.user_id]}); await refreshConversations(); setSelectedConversation(conversation); }
    } catch (error) { setChatError(error.message || 'Could not start chat.'); }
    finally { setChatBusy(false); }
  }
  async function createGroupFromForm(name, phoneText) {
    const phones = [...new Set(phoneText.split(',').map(value=>value.trim()).filter(Boolean))];
    const memberIds = [];
    const unregistered = [];
    for (const phone of phones) {
      const person = await findUserByPhone(phone);
      if (!person) unregistered.push(phone);
      else memberIds.push(person.user_id);
    }
    const conversation = await createConversation({kind:'group',title:name,memberIds});
    await refreshConversations();
    setSelectedConversation(conversation);
    setActive('chats');
    return {conversation,unregistered};
  }
  async function addGroupMembers(group, phoneText) {
    const phones = [...new Set(phoneText.split(',').map(value=>value.trim()).filter(Boolean))];
    const unregistered = [];
    for (const phone of phones) {
      const person = await findUserByPhone(phone);
      if (!person) { unregistered.push(phone); continue; }
      await addConversationMember(group.id, person.user_id);
    }
    await refreshConversations();
    return {unregistered};
  }
  async function submitMessage(event) {
    event.preventDefault(); if (!selectedConversation || !message.trim()) return;
    const body=message.trim(); setMessage(''); setChatError('');
    try { const row=await sendMessage(selectedConversation.id,body); setChatMessages(current=>current.some(item=>item.id===row.id)?current:[...current,row]); setConversations(current=>current.map(c=>c.id===row.conversation_id?{...c,lastMessage:row}:c)); }
    catch(error) { setMessage(body); setChatError(error.message||'Message could not be sent.'); }
  }
  const theme = themes[selectedTheme] || themes[0];
  const vars = useMemo(()=>useCustom?{'--user-bg':custom.background,'--user-surface':custom.surface,'--user-accent':custom.accent}:{'--user-bg':theme.colors[0],'--user-surface':theme.colors[1],'--user-accent':theme.colors[2]},[useCustom,custom,theme]);
  useEffect(()=>{localStorage.setItem('htc-theme',String(selectedTheme));localStorage.setItem('htc-custom',JSON.stringify(custom));localStorage.setItem('htc-use-custom',String(useCustom));},[selectedTheme,custom,useCustom]);
  useEffect(() => listenForChatDownloads(
    (record) => window.dispatchEvent(new CustomEvent('htc:local-file-saved', { detail: record })),
    (error) => window.dispatchEvent(new CustomEvent('htc:local-file-save-error', { detail: error }))
  ), []);

  return <div className="app-shell" style={vars}>
    <aside className={`sidebar ${mobileMenu?'show':''}`}><div className="language-switch app-language"><button onClick={()=>setLang('bn')} className={lang==='bn'?'active':''}>বাংলা</button><button onClick={()=>setLang('en')} className={lang==='en'?'active':''}>English</button></div>
      <div className="brand"><div className="brand-mark"><MessageCircle size={23}/></div><div><strong>Happy Time</strong><span>CONNECT</span></div></div>
      <button type="button" className="profile-card profile-card-button" onClick={openAccountSettings}>{profilePhoto?<img className="avatar user profile-card-photo" src={profilePhoto} alt="Profile"/>:<div className="avatar user">HT</div>}<div><b>{profileDisplayName||myProfile?.displayName||tr('স্বাগতম','Welcome')}</b><small>{myProfile?.phone||tr('আপনার অ্যাকাউন্ট','Your account')}</small></div><span className="online-dot"/></button>
      <nav>{tabs.map(({id,label,icon:Icon})=><button key={id} className={active===id?'nav-item active':'nav-item'} onClick={()=>{setActive(id);setMobileMenu(false)}}><Icon size={19}/><span>{tr(label, ({'চ্যাট':'Chats','গ্রুপ':'Groups','কল':'Calls','স্টোরেজ':'Storage','প্রাইভেট':'Private','থিম ও সেটিংস':'Themes & Settings'})[label] || label)}</span></button>)}</nav>
      <div className="sidebar-bottom"><ShieldCheck size={17}/><span>{tr('নিরাপদ যোগাযোগ','Secure communication')}</span><button aria-label="Settings" onClick={()=>setActive('settings')}><Settings size={17}/></button></div>
    </aside>
    <main className="main-panel">
      <header className="topbar"><button className="icon-btn mobile-only" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Menu"><Menu/></button><div><p className="eyebrow">{tr('আপনার যোগাযোগের জায়গা','Your communication space')}</p><h1>{title}</h1></div><div className="top-actions"><button className="icon-btn" aria-label="Search"><Search size={19}/></button><button type="button" className="account-avatar-button" aria-label="প্রোফাইল ও সেটিংস" onClick={openAccountSettings} onPointerUp={openAccountSettings}>{profilePhoto?<img src={profilePhoto} alt="Profile"/>:<span>HT</span>}<i><Settings size={13}/></i></button></div></header>
      {active==='chats'&&<section className={`content-grid ${selectedConversation ? 'has-selected-chat' : ''}`}>
        <div className="chat-list panel-card"><div className="section-heading"><div><h2>{tr('আপনার কথোপকথন','Your conversations')}</h2><p>{tr('ব্যক্তিগত ও গ্রুপ মেসেজ','Personal and group messages')}</p></div><button className="primary-icon" aria-label="New chat" onClick={startPrivateChat} disabled={chatBusy}><Plus size={19}/></button></div>
          <label className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tr('চ্যাট খুঁজুন','Search chats')}/></label>
          {filtered.map(chat=>{const other=chat.members?.find(m=>m.user_id!==myProfile?.id);const label=chat.kind==='group'?(chat.title||'Group'):(other?.user_id||tr('ব্যক্তিগত চ্যাট','Private chat'));return <button className={selectedConversation?.id===chat.id?'chat-row selected':'chat-row'} key={chat.id} onClick={()=>setSelectedConversation(chat)}><div className="avatar mint">{chat.kind==='group'?<Users size={21}/>:label.slice(0,1)}</div><div className="chat-meta"><b>{label}</b><span>{chat.lastMessage?.body||tr('এখনো কোনো মেসেজ নেই','No messages yet')}</span></div><div className="chat-side"><small>{chat.lastMessage?new Date(chat.lastMessage.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):''}</small></div></button>})}
          {!filtered.length&&<div className="empty-note">{chatBusy?tr('লোড হচ্ছে...','Loading...'):tr('এখনো কোনো কথোপকথন নেই। + চাপ দিয়ে ফোন নম্বর দিয়ে নতুন চ্যাট শুরু করুন।','No conversations yet. Tap + to start a chat using a phone number.')}</div>}
        </div>
        <div className="conversation panel-card"><div className="conversation-head"><button type="button" className="mobile-chat-back" onClick={()=>setSelectedConversation(null)} aria-label="Back to chats"><X size={19}/></button><div className="avatar mint">{selectedConversation?.kind==='group'?<Users size={21}/>:<MessageCircle size={21}/>}</div><div><b>{selectedConversation?.kind==='group'?(selectedConversation.title||'Group'):selectedConversation?tr('ব্যক্তিগত চ্যাট','Private chat'):tr('কথোপকথন নির্বাচন করুন','Select a conversation')}</b><small>{selectedConversation?tr('সংযুক্ত কথোপকথন','Connected conversation'):tr('আপনার মেসেজিং স্পেস','Your messaging space')}</small></div></div>
          {selectedConversation?<div className="message-history">{chatMessages.map(row=><div key={row.id} className={row.sender_id===myProfile?.id?'message-bubble mine':'message-bubble'}><p>{row.body}</p><small>{new Date(row.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div>)}</div>:<div className="welcome"><div className="welcome-icon"><MessageCircle size={34}/></div><h2>{tr('একসাথে থাকুন, সংযুক্ত থাকুন','Stay together, stay connected')}</h2><p>{tr('নতুন চ্যাট শুরু করতে বাম পাশের + বাটনে চাপ দিন।','Tap + on the left to start a new chat.')}</p><div className="feature-pills"><span><Smartphone size={14}/> Phone Storage</span><span><LockKeyhole size={14}/> Private Chat</span></div></div>}
          {chatError&&<div className="feature-notice">{chatError}</div>}
          <form className="message-compose" onSubmit={submitMessage}><button type="button" className="icon-btn" disabled><Paperclip size={19}/></button><input value={message} onChange={e=>setMessage(e.target.value)} placeholder={tr('মেসেজ লিখুন...','Write a message...')} disabled={!selectedConversation||chatBusy}/><button type="button" className="icon-btn" disabled><Mic size={19}/></button><button className="send-btn" disabled={!selectedConversation||!message.trim()||chatBusy}><Send size={17}/></button></form>
        </div>
      </section>}
      {active==='settings'&&<section className="theme-settings">
        <div className="theme-intro panel-card"><div className="theme-intro-icon"><Palette size={28}/></div><div><h2>{tr('আপনার অ্যাপ, আপনার পছন্দের রং','Your app, your colors')}</h2><p>{tr('৫০টি ভিজ্যুয়াল থিম এবং ১২০টি কালার থেকে বেছে নিন। চাইলে নিজের মতো করে রং সেট করুন।','Choose from 50 visual themes and 120+ colors, or customize your own.')}</p></div></div>
        <div className="theme-section panel-card"><div className="theme-section-head"><div><h2>{tr('থিম গ্যালারি · ৫০টি','Theme Gallery · 50')}</h2><p>{tr('প্রতিটি থিমে আলাদা ব্যাকগ্রাউন্ড ও রঙের সমন্বয়','Each theme has a unique background and color combination')}</p></div><span className="count-badge">50 THEMES</span></div>
          <div className="theme-grid">{themes.map(t=><button key={t.id} className={`theme-tile ${!useCustom&&selectedTheme===t.id?'chosen':''}`} onClick={()=>{setSelectedTheme(t.id);setUseCustom(false)}}><span className={`theme-art art-${t.variant}`} style={{'--t1':t.colors[0],'--t2':t.colors[1],'--t3':t.colors[2]}}><i/><i/><i/></span><span className="theme-tile-name">{t.name}</span>{!useCustom&&selectedTheme===t.id&&<span className="theme-check"><Check size={13}/></span>}</button>)}</div>
        </div>
        <div className="theme-section panel-card"><div className="theme-section-head"><div><h2>{tr('কালার লাইব্রেরি · ১২০+ রং','Color Library · 120+ colors')}</h2><p>{tr('এক ক্লিকে Accent Color পরিবর্তন করুন','Change the accent color with one click')}</p></div><span className="count-badge">120+ COLORS</span></div><div className="color-grid">{colorChoices.map((color,i)=><button key={i} title={color} aria-label={`রং ${i+1}`} className={custom.accent===color?'color-dot active-color':''} style={{background:color}} onClick={()=>{setCustom(v=>({...v,accent:color}));setUseCustom(true)}}/>)}</div></div>
        <div className="theme-section panel-card"><div className="theme-section-head"><div><h2>{tr('ম্যানুয়াল কালার কাস্টমাইজার','Manual Color Customizer')}</h2><p>{tr('নিজের পছন্দমতো Background, Card ও Accent Color ঠিক করুন','Set your preferred background, card and accent colors')}</p></div><button className="reset-theme" onClick={()=>{setCustom({background:'#071a24',surface:'#173b46',accent:'#38e0b2'});setUseCustom(true)}}><RotateCcw size={14}/> Reset</button></div>
          <div className="manual-colors">{[['background','Background Color'],['surface','Card / Panel Color'],['accent','Accent / Button Color']].map(([key,label])=><label className="manual-color" key={key}><span>{label}</span><input type="color" value={custom[key]} onChange={e=>{setCustom(v=>({...v,[key]:e.target.value}));setUseCustom(true)}}/><code>{custom[key]}</code></label>)}</div>
          <div className="theme-preview"><div className="preview-bubble">{tr('এটি আপনার থিমের নমুনা','This is a theme preview')}</div><button className="preview-button">{tr('নমুনা বাটন','Preview Button')}</button></div>
          <button className="apply-theme" onClick={()=>{setUseCustom(true);localStorage.setItem('htc-use-custom','true')}}><Check size={17}/> {tr('আমার থিম সেভ করুন','Save my theme')}</button>
          <button type="button" className="apply-theme" style={{marginTop:12,background:'#a83245'}} onClick={async()=>{const {error}=await supabase.auth.signOut();if(error)window.alert(error.message);}}><X size={17}/> {tr('লগআউট করুন','Log out')}</button>
        </div>
      </section>}
      {active==='storage'&&<StoragePanel lang={lang}/>} {active!=='chats'&&active!=='settings'&&active!=='storage'&&<FeatureWorkspace active={active} lang={lang} groups={conversations.filter(c=>c.kind==='group')} onCreateGroup={createGroupFromForm} onOpenGroup={group=>{setSelectedConversation(group);setActive('chats');}} onAddGroupMembers={addGroupMembers} myProfile={myProfile} conversations={conversations}/>}
      {accountMenuOpen&&<div className="account-modal-backdrop" role="dialog" aria-modal="true">
      <section className="account-modal panel-card">
        <header className="account-modal-header"><div><span className="feature-kicker">HAPPY TIME CONNECT</span><h2>{tr('অ্যাকাউন্ট ও সেটিংস','Account & Settings')}</h2><p>{myProfile?.phone||''}</p></div><button className="icon-btn" onClick={()=>setAccountMenuOpen(false)} aria-label="Close"><X/></button></header>
        <div className="account-layout"><nav className="account-menu">
          <button className={accountSection==='profile'?'active':''} onClick={()=>setAccountSection('profile')}><User size={18}/>{tr('প্রোফাইল','Profile')}</button>
          <button className={accountSection==='notifications'?'active':''} onClick={()=>setAccountSection('notifications')}><Bell size={18}/>{tr('নোটিফিকেশন','Notifications')}</button>
          <button className={accountSection==='status'?'active':''} onClick={()=>setAccountSection('status')}><CircleDot size={18}/>{tr('স্ট্যাটাস','Status')}</button>
          <button className={accountSection==='security'?'active':''} onClick={()=>setAccountSection('security')}><Shield size={18}/>{tr('সিকিউরিটি','Security')}</button>
          <button className="account-logout" onClick={async()=>{const {error}=await supabase.auth.signOut();if(error)setAccountError(error.message);else setAccountMenuOpen(false);}}><LogOut size={18}/>{tr('লগ আউট','Log out')}</button>
        </nav><div className="account-content">
          {accountSection==='profile'&&<div className="account-section"><h3>{tr('আপনার প্রোফাইল','Your Profile')}</h3><div className="profile-photo-edit"><div className="profile-photo-large">{profilePhoto?<img src={profilePhoto} alt="Profile"/>:<span>HT</span>}</div><label className="feature-primary"><ImagePlus size={16}/>{tr('ছবি পরিবর্তন','Change photo')}<input type="file" accept="image/*" onChange={chooseProfilePhoto}/></label></div>
            <label>{tr('পার্সোনাল নেম','Personal Name')}<input className="account-input" value={profileDisplayName} onChange={e=>setProfileDisplayName(e.target.value)} placeholder={tr('আপনার ব্যক্তিগত নাম','Your personal name')}/></label>
            <label>{tr('প্রোফাইল নেম','Profile Name')}<input className="account-input" value={profileName} onChange={e=>setProfileName(e.target.value)} placeholder={tr('অন্যরা যে নামে দেখবে','Name shown to others')}/></label>
            <div className="account-readonly"><span>{tr('নিবন্ধিত মোবাইল','Registered mobile')}</span><b>{myProfile?.phone||'—'}</b></div>
            <button className="feature-primary account-save" onClick={saveAccountProfile} disabled={profileSaving}><Save size={16}/>{profileSaving?tr('সেভ হচ্ছে...','Saving...'):tr('প্রোফাইল সেভ করুন','Save profile')}</button>
          </div>}
          {accountSection==='notifications'&&<div className="account-section"><h3>{tr('নোটিফিকেশন সেটিংস','Notification Settings')}</h3><p>{tr('কোন ধরনের নোটিফিকেশন অ্যাপে অনুমোদন থাকবে তা নির্বাচন করুন।','Choose which notification types are enabled in the app.')}</p>{[['messages','মেসেজ নোটিফিকেশন','Message notifications'],['groups','গ্রুপ আপডেট','Group updates'],['calls','কল নোটিফিকেশন','Call notifications'],['sound','নোটিফিকেশন সাউন্ড','Notification sound']].map(([key,bn,en])=><label className="account-toggle" key={key}><span>{tr(bn,en)}</span><input type="checkbox" checked={!!notificationPrefs[key]} onChange={e=>setNotificationPrefs(p=>({...p,[key]:e.target.checked}))}/></label>)}<small>{tr('এগুলো অ্যাপের নোটিফিকেশন পছন্দ সংরক্ষণ করে; ব্যাকগ্রাউন্ড Push Notification আলাদাভাবে যুক্ত করতে হবে।','These save your in-app preferences; background push notifications require a separate integration.')}</small></div>}
          {accountSection==='status'&&<div className="account-section"><h3>{tr('আপনার স্ট্যাটাস','Your Status')}</h3><p>{tr('অন্যদের কাছে আপনার বর্তমান উপস্থিতি নির্বাচন করুন।','Choose your presence status.')}</p>{[['online','অনলাইন','Online'],['busy','ব্যস্ত','Busy'],['away','অনুপস্থিত','Away'],['invisible','অফলাইন দেখান','Appear offline']].map(([value,bn,en])=><button key={value} className={accountStatus===value?'account-status-option selected':'account-status-option'} onClick={()=>setAccountStatus(value)}><span className={'status-dot '+value}/>{tr(bn,en)}{accountStatus===value&&<Check size={17}/>}</button>)}</div>}
          {accountSection==='security'&&<div className="account-section"><h3>{tr('অ্যাকাউন্ট সিকিউরিটি','Account Security')}</h3><div className="account-readonly"><span>{tr('লগইন মোবাইল','Login mobile')}</span><b>{myProfile?.phone||'—'}</b></div><label>{tr('নতুন ৬ অক্ষরের পাসওয়ার্ড','New 6-character password')}<input className="account-input" value={newPassword} onChange={e=>setNewPassword(e.target.value.replace(/[^A-Za-z0-9]/g,'').slice(0,6))} type="password" maxLength={6} placeholder="••••••"/></label><button className="feature-primary account-save" onClick={changeAccountPassword}>{tr('পাসওয়ার্ড পরিবর্তন করুন','Update password')}</button><div className="account-readonly"><span>{tr('সেশন সুরক্ষা','Session security')}</span><b>{tr('সুপাবেস অথেনটিকেশন','Supabase Authentication')}</b></div><small>{tr('আপনার পাসওয়ার্ড কাউকে দেবেন না। লগ আউট করলে এই ডিভাইসের সেশন বন্ধ হবে।','Never share your password. Logging out ends this device session.')}</small></div>}
          {accountNotice&&<div className="vault-success">{accountNotice}</div>}{accountError&&<div className="vault-error">{accountError}</div>}
        </div></div>
      </section>
    </div>}
    <footer className="footer-note">Happy Time Connect <span>•</span> {tr('প্রাথমিক সংস্করণ 0.2','Early version 0.2')}</footer>
    </main>
    <nav className="mobile-nav">{tabs.map(({id,label,icon:Icon})=><button key={id} className={active===id?'selected':''} onClick={()=>setActive(id)}><Icon size={19}/><span>{tr(label, ({'চ্যাট':'Chats','গ্রুপ':'Groups','কল':'Calls','স্টোরেজ':'Storage','প্রাইভেট':'Private','থিম ও সেটিংস':'Themes & Settings'}[label] || label))}</span></button>)}</nav>
  </div>;
}

const countryDialCodes = [
  ['AF','93'],['AL','355'],['DZ','213'],['AD','376'],['AO','244'],['AG','1-268'],['AR','54'],['AM','374'],['AU','61'],['AT','43'],['AZ','994'],
  ['BS','1-242'],['BH','973'],['BD','880'],['BB','1-246'],['BY','375'],['BE','32'],['BZ','501'],['BJ','229'],['BT','975'],['BO','591'],['BA','387'],['BW','267'],['BR','55'],['BN','673'],['BG','359'],['BF','226'],['BI','257'],
  ['KH','855'],['CM','237'],['CA','1'],['CV','238'],['CF','236'],['TD','235'],['CL','56'],['CN','86'],['CO','57'],['KM','269'],['CG','242'],['CD','243'],['CR','506'],['CI','225'],['HR','385'],['CU','53'],['CY','357'],['CZ','420'],
  ['DK','45'],['DJ','253'],['DM','1-767'],['DO','1-809'],['EC','593'],['EG','20'],['SV','503'],['GQ','240'],['ER','291'],['EE','372'],['SZ','268'],['ET','251'],['FJ','679'],['FI','358'],['FR','33'],['GA','241'],['GM','220'],['GE','995'],['DE','49'],['GH','233'],['GR','30'],['GD','1-473'],['GT','502'],['GN','224'],['GW','245'],['GY','592'],
  ['HT','509'],['HN','504'],['HK','852'],['HU','36'],['IS','354'],['IN','91'],['ID','62'],['IR','98'],['IQ','964'],['IE','353'],['IL','972'],['IT','39'],['JM','1-876'],['JP','81'],['JO','962'],['KZ','7'],['KE','254'],['KI','686'],['KP','850'],['KR','82'],['KW','965'],['KG','996'],['LA','856'],['LV','371'],['LB','961'],['LS','266'],['LR','231'],['LY','218'],['LI','423'],['LT','370'],['LU','352'],
  ['MO','853'],['MG','261'],['MW','265'],['MY','60'],['MV','960'],['ML','223'],['MT','356'],['MH','692'],['MR','222'],['MU','230'],['MX','52'],['FM','691'],['MD','373'],['MC','377'],['MN','976'],['ME','382'],['MA','212'],['MZ','258'],['MM','95'],['NA','264'],['NR','674'],['NP','977'],['NL','31'],['NZ','64'],['NI','505'],['NE','227'],['NG','234'],['MK','389'],['NO','47'],['OM','968'],['PK','92'],['PW','680'],['PS','970'],['PA','507'],['PG','675'],['PY','595'],['PE','51'],['PH','63'],['PL','48'],['PT','351'],['QA','974'],['RO','40'],['RU','7'],['RW','250'],
  ['KN','1-869'],['LC','1-758'],['VC','1-784'],['WS','685'],['SM','378'],['ST','239'],['SA','966'],['SN','221'],['RS','381'],['SC','248'],['SL','232'],['SG','65'],['SK','421'],['SI','386'],['SB','677'],['SO','252'],['ZA','27'],['SS','211'],['ES','34'],['LK','94'],['SD','249'],['SR','597'],['SE','46'],['CH','41'],['SY','963'],['TW','886'],['TJ','992'],['TZ','255'],['TH','66'],['TL','670'],['TG','228'],['TO','676'],['TT','1-868'],['TN','216'],['TR','90'],['TM','993'],['TV','688'],['UG','256'],['UA','380'],['AE','971'],['GB','44'],['US','1'],['UY','598'],['UZ','998'],['VU','678'],['VA','379'],['VE','58'],['VN','84'],['YE','967'],['ZM','260'],['ZW','263']
];
const countryNames = new Intl.DisplayNames(['bn'], { type: 'region' });
const countryOptions = countryDialCodes.map(([iso, dial]) => ({iso,dial,name:countryNames.of(iso)})).sort((a,b)=>a.name.localeCompare(b.name,'bn'));

function App() {
  const [lang,setLang] = useState(() => localStorage.getItem('htc-language') || 'bn');
  const tr = (bn,en) => lang === 'bn' ? bn : en;
  useEffect(() => { localStorage.setItem('htc-language',lang); }, [lang]);
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [country, setCountry] = useState('BD');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newRecoveryCode, setNewRecoveryCode] = useState('');
  const [mode, setMode] = useState('signup');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedCountry = countryOptions.find(item=>item.iso===country) || countryOptions.find(item=>item.iso==='BD');
  const loginEmail = (fullPhone) => fullPhone.replace(/\D/g, '') + '@phone.happytimeconnect.invalid';
  const normalizedPhone = () => {
    const digits = phone.replace(/\D/g, '');
    if ((country === 'BD' && !/^\d{11}$/.test(digits)) || (country !== 'BD' && !/^\d{7,15}$/.test(digits))) return null;
    const local = country === 'BD' ? digits.replace(/^0/, '') : digits;
    return '+' + selectedCountry.dial.replace(/\D/g, '') + local;
  };
  const makeRecoveryCode = () => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return String((((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0) % 10000).padStart(4, '0');
  };
  const hashCode = async (value) => {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), b=>b.toString(16).padStart(2,'0')).join('');
  };

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setChecking(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    const fullPhone = normalizedPhone();
    if (!fullPhone) {
      setError(country === 'BD' ? 'বাংলাদেশের ১১ সংখ্যার মোবাইল নম্বর লিখুন।' : 'নির্বাচিত দেশের সঠিক মোবাইল নম্বর লিখুন।');
      return;
    }
    if (!supabase) { setError('Supabase সংযোগ পাওয়া যায়নি।'); return; }

    if (mode === 'forgot') {
      if (!/^\d{4}$/.test(recoveryCode)) { setError('আপনার ৪ সংখ্যার Recovery Code লিখুন।'); return; }
      if (!/^[A-Za-z0-9]{6}$/.test(pin)) { setError('নতুন পাসওয়ার্ড ঠিক ৬ অক্ষরের হতে হবে।'); return; }
      setBusy(true);
      const recoveryHash = await hashCode(recoveryCode);
      const { data, error: rpcError } = await supabase.rpc('reset_password_with_recovery_code', {
        p_phone: fullPhone,
        p_recovery_hash: recoveryHash,
        p_new_password: pin
      });
      setBusy(false);
      if (rpcError) { setError(rpcError.message); return; }
      if (data !== true) { setError('মোবাইল নম্বর অথবা Recovery Code সঠিক নয়।'); return; }
      setNotice('নতুন পাসওয়ার্ড সেট হয়েছে। এখন লগইন করুন।');
      setMode('login');
      setPin('');
      setRecoveryCode('');
      return;
    }

    if (!/^[A-Za-z0-9]{6}$/.test(pin)) {
      setError('পাসওয়ার্ড ঠিক ৬ অক্ষরের হতে হবে। ইংরেজি অক্ষর ও সংখ্যা ব্যবহার করতে পারবেন।');
      return;
    }
    setBusy(true);
    const email = loginEmail(fullPhone);
    let result;
    let generatedCode = '';
    if (mode === 'signup') {
      generatedCode = makeRecoveryCode();
      const recoveryHash = await hashCode(generatedCode);
      result = await supabase.auth.signUp({
        email,
        password: pin,
        options: { data: { phone: fullPhone, display_name: fullPhone, recovery_code_hash: recoveryHash } }
      });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password: pin });
    }
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    if (mode === 'signup' && !result.data.session) {
      setError('অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু Supabase-এ Confirm email বন্ধ করতে হবে।');
      return;
    }
    if (mode === 'signup') setNewRecoveryCode(generatedCode);
  }

  async function copyRecoveryCode() {
    try { await navigator.clipboard.writeText(newRecoveryCode); setNotice('Recovery Code কপি হয়েছে। নিরাপদ জায়গায় লিখে রাখুন।'); }
    catch { setNotice('কোডটি হাতে লিখে নিরাপদ জায়গায় সংরক্ষণ করুন।'); }
  }

  if (checking) return <div className="auth-screen"><div className="auth-card"><h1>Happy Time Connect</h1><p>অ্যাকাউন্ট যাচাই হচ্ছে...</p></div></div>;
  if (newRecoveryCode) return <div className="auth-screen"><section className="auth-card recovery-card">
    <div className="auth-mark"><ShieldCheck size={28}/></div><h1>{tr('আপনার Recovery Code','Your Recovery Code')}</h1>
    <p>{tr('এই ৪ সংখ্যার কোডটি এখনই কপি করে কাগজে লিখে নিরাপদ জায়গায় রাখুন। পাসওয়ার্ড ভুলে গেলে এই কোড দিয়ে নতুন পাসওয়ার্ড সেট করতে পারবেন।','Copy this 4-digit code and keep it somewhere safe. If you forget your password, you can use this code to set a new one.')}</p>
    <div className="recovery-code-box" dir="ltr">{newRecoveryCode}</div>
    <button type="button" className="auth-submit" onClick={copyRecoveryCode}>{tr(tr('কোড কপি করুন','Copy recovery code'),'Copy recovery code')}</button>
    {notice && <div className="auth-notice">{notice}</div>}
    <button type="button" className="auth-submit" onClick={()=>{setNewRecoveryCode('');setNotice('');}} >{tr(tr('কোড সংরক্ষণ করেছি — চালিয়ে যান','I have saved the code — Continue'),'I have saved the code — Continue')}</button>
    <small>এই কোড আর পরে দেখানো হবে না। কাউকে দেবেন না। ফোন হারালে কোডটি আলাদা নিরাপদ জায়গায় রাখুন।</small>
  </section></div>;
  if (!session) return <div className="auth-screen"><form className="auth-card" onSubmit={handleAuth}><div className="language-switch"><button type="button" className={lang==='bn'?'active':''} onClick={()=>setLang('bn')}>বাংলা</button><button type="button" className={lang==='en'?'active':''} onClick={()=>setLang('en')}>English</button></div>
    <div className="auth-mark"><MessageCircle size={28}/></div>
    <h1>Happy Time Connect</h1>
    <p>{tr('মোবাইল নম্বর ও ৬ অক্ষরের পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুলুন বা প্রবেশ করুন।','Create an account or sign in with your mobile number and 6-character password.')}</p>
    {!isSupabaseConfigured && <div className="auth-error">Supabase URL ও Publishable Key সেট করা নেই।</div>}
    <div className="auth-mode-switch">
      <button type="button" className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setError('');setNotice('');}}>সাইন আপ</button>
      <button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('');setNotice('');}}>লগইন</button>
    </div>
    <label>{tr('দেশ নির্বাচন ও মোবাইল নম্বর','Country and mobile number')}</label>
    <div className="phone-entry">
      <select className="country-select" value={country} onChange={e=>{setCountry(e.target.value);setPhone('');}} aria-label="দেশের কোড নির্বাচন">
        {countryOptions.map(item=><option key={item.iso} value={item.iso}>{item.name} (+{item.dial})</option>)}
      </select>
      <input className="auth-input phone-number-input" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,country==='BD'?11:15))} placeholder={country==='BD'?'01XXXXXXXXX':tr('মোবাইল নম্বর','Mobile number')} autoComplete="tel-national" inputMode="numeric"/>
    </div>
    {mode==='forgot' && <>
      <label>৪ সংখ্যার Recovery Code</label>
      <input className="auth-input" value={recoveryCode} onChange={e=>setRecoveryCode(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder={tr(tr('৪ সংখ্যার কোড','4-digit code'),'4-digit recovery code')} inputMode="numeric" maxLength={4}/>
    </>}
    <label>{mode==='forgot'?tr('নতুন ৬ অক্ষরের পাসওয়ার্ড','New 6-character password'):tr('৬ অক্ষরের পাসওয়ার্ড (অক্ষর বা সংখ্যা)','6-character password (letters or numbers)')}</label>
    <input className="auth-input" value={pin} onChange={e=>setPin(e.target.value.replace(/[^A-Za-z0-9]/g,'').slice(0,6))} placeholder={tr(tr('৬ অক্ষরের পাসওয়ার্ড','6-character password'),'6-character password')} type="password" autoComplete={mode==='signup'?'new-password':'current-password'} maxLength={6}/>
    {mode==='login' && <button type="button" className="forgot-link" onClick={()=>{setMode('forgot');setPin('');setError('');setNotice('');}}>পাসওয়ার্ড ভুলে গেছেন? Forgot Password</button>}
    <button className="auth-submit" disabled={busy || !isSupabaseConfigured}>{busy?tr('অপেক্ষা করুন...','Please wait...'):mode==='signup'?tr('সাইন আপ','Sign up'):mode==='forgot'?tr('নতুন পাসওয়ার্ড সেট করুন','Set new password'):tr('লগইন','Sign in')}</button>
    <p className="facebook-note">{tr('পরামর্শ: আপনি যদি Facebook-এর মাধ্যমে লগইন করেন, তাহলে ভবিষ্যতে অ্যাকাউন্টে প্রবেশ বা তথ্য ফিরে পেতে এটি সহায়ক হতে পারে।','Tip: If you sign in with Facebook, it may help you regain access to your account or recover your information in the future.')}</p>
    <button type="button" className="facebook-login" onClick={async()=>{setError('');const {error:e}=await supabase.auth.signInWithOAuth({provider:'facebook',options:{redirectTo:window.location.origin}});if(e)setError(e.message);}}>{tr('Facebook দিয়ে লগইন (ঐচ্ছিক)','Continue with Facebook (Optional)')}</button>
    {mode==='forgot' && <button type="button" className="auth-back" onClick={()=>{setMode('login');setError('');}} >{tr('লগইনে ফিরে যান','Back to login')}</button>}
    {notice && <div className="auth-notice">{notice}</div>}
    {error && <div className="auth-error">{error}</div>}
    <small>{tr('SMS/OTP প্রয়োজন নেই। সাইনআপের পর পাওয়া ৪ সংখ্যার Recovery Code নিরাপদে সংরক্ষণ করুন।','No SMS/OTP is required. Keep the 4-digit recovery code from signup in a safe place.')}</small>
  </form></div>;
  return <MainApp lang={lang} setLang={setLang}/>;
}

export default App;

