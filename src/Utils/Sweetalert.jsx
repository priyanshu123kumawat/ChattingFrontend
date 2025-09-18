// src/utils/alert.js
import Swal from "sweetalert2";

export const showSuccess = (title, text) => {
  return Swal.fire({
    position: "top-end",         // top right
    icon: "success",
    title,
    text,
    showConfirmButton: false,
    timer: 3000,
    toast: true,
    customClass: {
      popup: 'my-small-toast'    // custom css class
    }
  });
};

export const showError = (title, text) => {
  return Swal.fire({
    position: "top-end",
    icon: "error",
    title,
    text,
    showConfirmButton: false,
    timer: 3000,
    toast: true,
    customClass: {
      popup: 'my-small-toast'
    }
  });
};
