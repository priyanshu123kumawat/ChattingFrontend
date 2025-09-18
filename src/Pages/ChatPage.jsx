import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import ChatHeader from "../components/Chat/ChatHeader";
import ChatMessages from "../components/Chat/ChatMessages";
import ChatInput from "../components/Chat/ChatInput";
import { FiMic, FiMicOff, FiVideoOff, FiVolume2, FiPhoneOff } from "react-icons/fi";
import { FaPhoneAlt, FaPhone } from "react-icons/fa";
import { baseurl } from "../Utils/helper";

const socket = io(`${baseurl}`, { autoConnect: false });

export default function ChatPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [roomInfo, setRoomInfo] = useState({});

  const [partnerId, setPartnerId] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerImage, setPartnerImage] = useState(null);

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isMute, setIsMute] = useState(false);

  const peerRef = useRef(null);
  const pendingCandidates = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const bottomRef = useRef(null);
  const observerRef = useRef(null);
  const localStreamRef = useRef(null);


  // ─── Initialization ─────────────────────────────────────────────────────────
  useEffect(() => {
    // partner details for 1:1
    const id = location.state?.partnerId || localStorage.getItem(`chat_${roomId}_partnerId`);
    const name = location.state?.partnerName || localStorage.getItem(`chat_${roomId}_partnerName`);
    const img = location.state?.partnerImage || localStorage.getItem(`chat_${roomId}_partnerImage`);
    if (id) setPartnerId(id);
    if (name) setPartnerName(name);
    if (img) setPartnerImage(img);

    fetchHistory();

    if (!socket.connected) socket.connect();
    socket.emit("register", { userId: currentUser._id });
    socket.emit("join-video-room", roomId);

    socket.on("online-users", (ids) => { setOnlineUsers(ids); });
    socket.on("user-online", ({ userId }) => setOnlineUsers(prev => [...new Set([...prev, userId])]));
    socket.on("user-offline", ({ userId }) => setOnlineUsers(prev => prev.filter(id => id !== userId)));

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageStatusUpdate", handleMessageStatusUpdate);
    socket.on("receive-video-offer", handleReceiveOffer);
    socket.on("receive-video-answer", handleReceiveAnswer);
    socket.on("receive-ice-candidate", handleICECandidate);
    socket.on("user-left-video", handleUserLeft);
    socket.on("call-rejected", () => { setIncomingCall(null); endCall(); });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageStatusUpdate", handleMessageStatusUpdate);
      socket.off("receive-video-offer", handleReceiveOffer);
      socket.off("receive-video-answer", handleReceiveAnswer);
      socket.off("receive-ice-candidate", handleICECandidate);
      socket.off("user-left-video", handleUserLeft);
      socket.off("call-rejected");
      socket.off("online-users");
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, [roomId]);

  // ─── Update video elements streams ─────────────────────────────────────────
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log("[WebRTC] Attached local stream to localVideoRef");
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log("[WebRTC] Attached remote stream to remoteVideoRef");
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      console.log("[WebRTC] Attached remote stream to remoteAudioRef");
    }
  }, [remoteStream]);


  // ─── Scroll messages into view ───────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ─── Mark seen messages when in viewport ────────────────────────────────────
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const mid = entry.target.getAttribute("data-id");
          const m = messages.find(m => m.messageId === mid);
          if (m && m.senderId !== currentUser._id && m.status !== "seen") {
            socket.emit("message-seen", { messageId: m.messageId, fromUserId: currentUser._id });
          }
        }
      });
    }, { threshold: 1 });

    document.querySelectorAll("[data-id]").forEach(el => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, [messages]);

  // ─── Fetch chat history ─────────────────────────────────────────────────────
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${baseurl}/chat/history`, { roomId });
      if (res.data.success) {
        const msgs = res.data.data.map(msg => ({
          messageId: msg._id,
          senderId: msg.sender?._id,
          senderName: msg.sender?.name,
          message: msg.message,
          status: msg.status || "sent",
          createdAt: msg.createdAt
        }));
        setMessages(msgs);
      }
    } catch (err) {
      console.error("History API error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Receive new message ────────────────────────────────────────────────────
  const handleReceiveMessage = data => {
    if (data.roomId !== roomId) return;
    setMessages(prev => [
      ...prev,
      {
        messageId: data.messageId,
        senderId: data.fromUserId,
        senderName: data.senderName || currentUser.name,
        message: data.message,
        status: "delivered",
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const handleMessageStatusUpdate = ({ messageId, status }) => {
    setMessages(prev => prev.map(m => m.messageId === messageId ? { ...m, status } : m));
  };

  // Send Message (private vs group)
  const handleSend = () => {
    if (!newMsg.trim()) return;

    const tempId = `${Date.now()}_${Math.random()}`;
    const outgoing = {
      messageId: tempId,
      senderId: currentUser._id,
      senderName: currentUser.name,
      message: newMsg.trim(),
      status: "sending",
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, outgoing]);

    if (isGroupChat) {
      socket.emit("groupMessage", {
        roomId,
        fromUserId: currentUser._id,
        message: newMsg.trim(),
        tempId,
      });
    } else {
      socket.emit("myMessage", {
        toUserId: partnerId,
        fromUserId: currentUser._id,
        message: newMsg.trim(),
        roomId,
        tempId,
      });
    }

    setNewMsg("");
  };

  // Listen for status updates
  useEffect(() => {
    socket.on("messageStatusUpdate", ({ tempId, messageId, status }) => {
      setMessages(prev =>
        prev.map(m =>
          (m.messageId === tempId || m.messageId === messageId)
            ? { ...m, messageId: messageId || m.messageId, status }
            : m
        )
      );
    });

    return () => socket.off("messageStatusUpdate");
  }, []);


  // Video & Voice Call functions (same as before)
  const startCall = async ({ audio, video }) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support media devices.");
      return;
    }

    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    console.log("[WebRTC] Creating RTCPeerConnection", peerRef.current);

    pendingCandidates.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
      console.log("[WebRTC] Got local media stream", stream);
      localStreamRef.current = stream;
      setLocalStream(stream);

      stream.getTracks().forEach(track => {
        peerRef.current.addTrack(track, stream);
        console.log("[WebRTC] Added local track", track);
      });
    } catch (error) {
      console.error("getUserMedia error:", error);
      alert("Could not access microphone or camera.");
      return;
    }

    peerRef.current.ontrack = e => {
      console.log("[WebRTC] ontrack event", e);
      if (localStream && e.streams[0] === localStream) return;
      setRemoteStream(e.streams[0]);
      console.log("[WebRTC] Set remote stream", e.streams[0]);
      setCallConnected(true);
      setCallStartTime(Date.now());
    };

    peerRef.current.onicecandidate = e => {
      if (e.candidate) {
        console.log("[WebRTC] Sending ICE candidate", e.candidate);
        socket.emit("ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    const offer = await peerRef.current.createOffer();
    console.log("[WebRTC] Created offer", offer);
    await peerRef.current.setLocalDescription(offer);
    console.log("[WebRTC] Set local description (offer)", offer);
    socket.emit("video-offer", { roomId, offer });
    console.log("[WebRTC] Sent video-offer");
  };


  const startVoiceCall = () => { setIsVoiceCall(true); startCall({ audio: true, video: false }); };
  const startVideoCall = () => { setIsVoiceCall(false); startCall({ audio: true, video: true }); };

  const handleReceiveOffer = ({ offer }) => {
    console.log("[WebRTC] Received offer", offer);
    pendingCandidates.current = [];
    setIncomingCall({ offer, isVideo: offer.sdp.includes("m=video") });
  };


  const acceptIncomingCall = async () => {
    const { offer, isVideo } = incomingCall;
    setIsVoiceCall(!isVideo);

    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    console.log("[WebRTC] Creating RTCPeerConnection", peerRef.current);

    pendingCandidates.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
      console.log("[WebRTC] Got local media stream", stream);
      localStreamRef.current = stream;
      setLocalStream(stream);

      stream.getTracks().forEach(track => {
        peerRef.current.addTrack(track, stream);
        console.log("[WebRTC] Added local track", track);
      });
    } catch (error) {
      console.error("getUserMedia error:", error);
      alert("Could not access microphone or camera.");
      return;
    }

    peerRef.current.ontrack = e => {
      console.log("[WebRTC] ontrack event", e);
      if (localStream && e.streams[0] === localStream) return;
      setRemoteStream(e.streams[0]);
      console.log("[WebRTC] Set remote stream", e.streams[0]);
      setCallConnected(true);
      setCallStartTime(Date.now());
    };

    peerRef.current.onicecandidate = e => {
      if (e.candidate) {
        console.log("[WebRTC] Sending ICE candidate", e.candidate);
        socket.emit("ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    console.log("[WebRTC] Set remote description (offer)", offer);

    const answer = await peerRef.current.createAnswer();
    console.log("[WebRTC] Created answer", answer);
    await peerRef.current.setLocalDescription(answer);
    console.log("[WebRTC] Set local description (answer)", answer);

    socket.emit("video-answer", { roomId, answer });
    console.log("[WebRTC] Sent video-answer");

    for (const c of pendingCandidates.current) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
        console.log("[WebRTC] Added ICE candidate", c);
      } catch (e) {
        console.error(e);
      }
    }

    pendingCandidates.current = [];
    setIncomingCall(null);
  };



  const handleReceiveAnswer = async ({ answer }) => {
    console.log("[WebRTC] Received answer", answer);
    await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("[WebRTC] Set remote description (answer)", answer);
  };


  const handleICECandidate = async ({ candidate }) => {
    console.log("[WebRTC] Received ICE candidate", candidate);
    if (peerRef.current?.remoteDescription?.type) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("[WebRTC] Added ICE candidate", candidate);
      } catch (e) {
        console.error(e);
      }
    } else {
      pendingCandidates.current.push(candidate);
    }
  };


  const handleUserLeft = () => endCall();

  const endCall = () => {
    console.log("[WebRTC] Ending call");
    try {
      if (peerRef.current) {
        peerRef.current.getSenders().forEach(sender => sender.track?.stop());
        peerRef.current.close();
        peerRef.current = null;
        console.log("[WebRTC] Closed peer connection");
      }
    } catch (e) {
      console.error(e);
    }
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsVoiceCall(false);
    setCallConnected(false);
    setCallStartTime(null);
    socket.emit("leave-video-call", { roomId });
    console.log("[WebRTC] Left video call");
  };


  const rejectIncomingCall = () => {
    socket.emit("call-rejected", { roomId });
    setIncomingCall(null);
  };

  const CallTimer = ({ startTime }) => {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }, [startTime]);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    return <span>{minutes}:{seconds}</span>;
  };

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const audioTrack = stream.getAudioTracks().find(track => track.kind === "audio");

    if (audioTrack) {
      const shouldMute = audioTrack.enabled;
      audioTrack.enabled = !shouldMute;
      setIsMute(shouldMute);
    }
    console.log(audioTrack, "audio muted?")
  };



  const isPartnerOnline = onlineUsers.includes(partnerId);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="sticky top-0 z-20 shadow bg-white">
        <ChatHeader
          partnerName={isGroupChat ? roomInfo.name : partnerName}
          isOnline={!isGroupChat && isPartnerOnline}
          isGroupChat={isGroupChat}
          onVoiceCall={() => startVoiceCall?.()}
          onVideoCall={() => startVideoCall?.()}
          participants={roomInfo.users} // 👈 this is passed already
        />

      </div>

      {incomingCall && (
        <div className="fixed inset-0 flex flex-col justify-between items-center z-50" style={{ background: "linear-gradient(to top right, #4baea0, #5ea64d)" }}>
          <div className="flex-1 flex flex-col justify-center items-center mt-12">
            <div className="text-white text-lg font-semibold mb-4">{partnerName || "Friend"}</div>
            <img
              src={partnerImage || "https://plus.unsplash.com/premium_photo-1664124888904-435121e89c74?q=80&w=687"}
              alt="Avatar"
              className="rounded-full w-24 h-24 border-4 border-white shadow"
            />
          </div>
          <div className="flex justify-center items-center mb-12 space-x-40">
            <button onClick={acceptIncomingCall} className="bg-green-500 hover:bg-green-600 rounded-full p-4"><FaPhoneAlt /></button>
            <button onClick={rejectIncomingCall} className="bg-red-600 hover:bg-red-700 rounded-full p-4"><FaPhone /></button>
          </div>
        </div>
      )}

      {(localStream || remoteStream) && (
        <div className="fixed inset-0 flex flex-col z-50">
          <div className="flex-1 relative">
            {isVoiceCall ? (
              <div className="flex flex-col justify-between items-center h-full bg-[#075E54]">
                <div className="flex-1 flex flex-col justify-center items-center">
                  <img src={partnerImage || "https://plus.unsplash.com/premium_photo-1666901328734-3c6eb9b6b979?q=80&w=880"} alt="Avatar" className="rounded-full w-24 h-24 border-4 border-white shadow" />
                  <div className="mt-4 text-white text-xl font-semibold">{partnerName || "Unknown"}</div>
                  <div className="text-white text-sm mt-1">
                    {callConnected ? <CallTimer startTime={callStartTime} /> : "Calling…"}
                  </div>
                </div>
                <div className="w-full bg-black/30 backdrop-blur-md rounded-t-2xl p-4 flex justify-around items-center">
                  <button
                    onClick={toggleMic}
                    className="text-white hover:text-green-200 p-2"
                    title={isMute ? "Unmute Mic" : "Mute Mic"}
                  >
                    {isMute ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
                  </button>
                  <button disabled className="text-gray-400"><FiVideoOff className="w-6 h-6" /></button>
                  <button className="text-white hover:text-green-200"><FiVolume2 className="w-6 h-6" /></button>
                  <button onClick={endCall} className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4"><FiPhoneOff className="w-6 h-6" /></button>
                </div>
              </div>
            ) : (
              <>
                {remoteStream ? (
                  <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-black flex items-center justify-center text-white">Waiting for other user to join...</div>
                )}
                {localStream && (
                  <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 w-24 h-24 md:w-32 md:h-32 rounded-md shadow border border-white object-cover" />
                )}
              </>
            )}
          </div>
          <audio ref={remoteAudioRef} autoPlay />
          {!isVoiceCall && (
            <div className="flex justify-center py-4 bg-black/40">
              <button onClick={endCall} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full shadow">End Call</button>
            </div>
          )}
        </div>
      )}


      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <ChatMessages
            messages={messages}
            currentUser={currentUser}
            partnerImage={isGroupChat ? null : partnerImage}
            bottomRef={bottomRef}
            isGroupChat={isGroupChat}
          />
        )}
      </div>

      <div className="sticky bottom-0 bg-white shadow-inner px-2 md:px-4 py-2 z-10">
        <ChatInput newMsg={newMsg} setNewMsg={setNewMsg} handleSend={handleSend} />
      </div>
    </div>
  );
}




