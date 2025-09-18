// import React from "react";

// export default function ChatRoomCard({
//   room,
//   currentUser,
//   partnerId,
//   partnerName,
//   filter,
//   handleAcceptReject,
//   navigate
// }) {
//   const isGroup = room.type === "group";
//   const isCreator = room.createdBy === currentUser._id;
//   const isPendingUser = room.pendingUsers?.includes(currentUser._id);

//   const showAcceptRejectButtons = filter === "pending" && isPendingUser;
//   const showRequestSentText = filter === "pending" && isCreator;

//   const displayName = isGroup ? room.name : partnerName;
//   const displayPartnerId = isGroup ? null : partnerId;

//   return (
//     <div
//       className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 shadow hover:shadow-md flex flex-col space-y-2 transition duration-200 ${
//         filter === "active" ? "cursor-pointer hover:bg-gray-100" : ""
//       }`}
//       onClick={() => {
//         if (filter === "active") {
//           navigate(`/dashboard/chat/${room._id}`, {
//             state: { partnerId: displayPartnerId, partnerName: displayName },
//           });

//           localStorage.setItem(`chat_${room._id}_partnerId`, displayPartnerId || "");
//           localStorage.setItem(`chat_${room._id}_partnerName`, displayName);
//         }
//       }}
//     >
//       <div className="text-gray-800 font-semibold text-sm">
//         {displayName}
//       </div>

//       {filter === "pending" && (
//         <>
//           {showAcceptRejectButtons ? (
//             <div className="flex space-x-2">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleAcceptReject(room._id, "accept");
//                 }}
//                 className="flex-1 cursor-pointer bg-green-500 text-white text-xs py-1 rounded hover:bg-green-600"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleAcceptReject(room._id, "reject");
//                 }}
//                 className="flex-1 cursor-pointer bg-red-500 text-white text-xs py-1 rounded hover:bg-red-600"
//               >
//                 Reject
//               </button>
//             </div>
//           ) : showRequestSentText ? (
//             <div className="text-xs text-yellow-600 font-medium">Request sent</div>
//           ) : null}
//         </>
//       )}
//     </div>
//   );
// }



import React from "react";

export default function ChatRoomCard({
  room,
  currentUser,
  partnerId,
  partnerName,
  filter,
  handleAcceptReject,
  navigate
}) {
  const isGroup = room.type === "group";
  const isCreator = room.createdBy === currentUser._id;
  const isPendingUser = room.pendingUsers?.includes(currentUser._id);

  const showAcceptRejectButtons = filter === "pending" && isPendingUser;
  const showRequestSentText = filter === "pending" && isCreator;

  const displayName = isGroup ? room.name : partnerName;
  const displayPartnerId = isGroup ? null : partnerId;

  const handleClick = () => {
    if (filter === "active") {
      localStorage.setItem("selectedRoom", JSON.stringify(room));

      navigate(`/dashboard/chat/${room._id}`, {
        state: { partnerId: displayPartnerId, partnerName: displayName },
      });
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 shadow hover:shadow-md flex flex-col space-y-2 transition duration-200 ${
        filter === "active" ? "cursor-pointer hover:bg-gray-100" : ""
      }`}
      onClick={handleClick}
    >
      <div className="text-gray-800 font-semibold text-sm">
        {displayName}
      </div>

      {filter === "pending" && (
        <>
          {showAcceptRejectButtons ? (
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptReject(room._id, "accept");
                }}
                className="flex-1 cursor-pointer bg-green-500 text-white text-xs py-1 rounded hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptReject(room._id, "reject");
                }}
                className="flex-1 cursor-pointer bg-red-500 text-white text-xs py-1 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          ) : showRequestSentText ? (
            <div className="text-xs text-yellow-600 font-medium">Request sent</div>
          ) : null}
        </>
      )}
    </div>
  );
}
