import Swal from "sweetalert2";

function success(message: string) {

  return Swal.fire({
        icon: "success",
        title: "Success",
        text: message,
        showConfirmButton: true,
    });
}

function error(message: string = "An unexpected error occurred. Please try again later.") {
  return Swal.fire({
    icon: "error",
    title: "error",
    text: message,
    showConfirmButton: true,
  });
}

async function showConfirmationAlert(message: string): Promise<boolean> {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, I'm sure",
    cancelButtonText: 'No, go back',
    reverseButtons: true
  });

  return result.isConfirmed;
}

export const Dialogues = { success, error , showConfirmationAlert};
