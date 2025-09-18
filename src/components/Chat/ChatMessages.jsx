import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

export default function ChatMessages({
  messages,
  currentUser,
  partnerImage,
  bottomRef,
  isGroupChat = false, // ✅ Group chat toggle
}) {
  const renderTick = (status) => {
    switch (status) {
      case "sent":
        return <BsCheck className="text-gray-400" />;
      case "delivered":
        return <BsCheckAll className="text-gray-400" />;
      case "seen":
        return <BsCheckAll className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-3">
      {messages.map((msg, idx) => {
        const isMe = msg.senderId === currentUser._id;
        const showSenderName = isGroupChat && !isMe;

        return (
          <div
            key={msg.messageId || idx}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            data-id={msg.messageId}
          >
            <div
              className={`relative max-w-full rounded-[16px] px-4 py-1 shadow-md text-[12px] flex flex-col ${isMe ? "bg-green-800 text-white" : "bg-white text-gray-800"
                }`}
            >
              {/* Avatar: only for private chat and not me */}
              {!isMe && !isGroupChat && partnerImage && (
                <div className="absolute -left-5 top-0 w-7 h-7 rounded-full overflow-hidden border border-gray-300">
                  <img
                    src={partnerImage}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Sender Name (only in group chat & not me) */}
              {showSenderName && (
                <span className="text-[10px] font-semibold text-gray-500 mb-1">
                  {msg.sender?.name || msg.senderName || "Unknown"}
                </span>
              )}

              {/* Message text */}
              <div>{msg.message || ""}</div>

              {/* Time + Ticks */}
              <div className="text-[10px] text-right ml-7 flex items-center gap-1">
                {msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : ""}
                {isMe && (
                  <span className="text-[18px] leading-none">
                    {renderTick(msg.status)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </main>
  );
}










// import React from "react";
// import { BsCheck, BsCheckAll } from "react-icons/bs";

// export default function ChatMessages({
//   messages,
//   currentUser,
//   partnerImage,
//   bottomRef,
//   isGroupChat = false, // ✅ Group chat toggle
// }) {
//   const renderTick = (status) => {
//     switch (status) {
//       case "sent":
//         return <BsCheck className="text-gray-400" />;
//       case "delivered":
//         return <BsCheckAll className="text-gray-400" />;
//       case "seen":
//         return <BsCheckAll className="text-blue-500" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <main className="flex-1 overflow-y-auto p-8 space-y-3">
//       {messages.map((msg, idx) => {
//         const isMe = msg.senderId === currentUser._id;
//         const showSenderName = isGroupChat && !isMe;

//         return (
//           <div
//             key={idx}
//             className={`flex ${isMe ? "justify-end" : "justify-start"}`}
//             data-id={msg.messageId}
//           >
//             <div
//               className={`relative max-w-full rounded-[16px] px-4 py-1 shadow-md text-[12px] flex flex-col ${
//                 isMe ? "bg-green-800 text-white" : "bg-white text-gray-800"
//               }`}
//             >
//               {/* Avatar: only for private chat and not me */}
//               {!isMe && !isGroupChat && partnerImage && (
//                 <div className="absolute -left-5 top-0 w-7 h-7 rounded-full overflow-hidden border border-gray-300">
//                   <img
//                     src={partnerImage}
//                     alt="avatar"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               )}

//               {/* Sender Name (only in group chat & not me) */}
//               {showSenderName && (
//                 <span className="text-[10px] font-semibold text-gray-500 mb-1">
//                   {msg.sender?.name || "Unknown"}
//                 </span>
//               )}

//               {/* Message text */}
//               <div>{msg.message}</div>

//               {/* Time + Ticks */}
//               <div className="text-[10px] text-right ml-7 flex items-center gap-1">
//                 {new Date(msg.createdAt).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//                 {isMe && (
//                   <span className="text-[18px] leading-none">
//                     {renderTick(msg.status)}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//       <div ref={bottomRef} />
//     </main>
//   );
// }
