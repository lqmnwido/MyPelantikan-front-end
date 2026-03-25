import { onMounted, onUnmounted, watch } from "vue";
import { useAuthStore } from "@/state/pinia";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

export function useIdleTimeout() {
  const auth = useAuthStore();
  const router = useRouter();

  let idleTimer = null;
  let warningTimer = null;

  const idleLimit = 30 * 60 * 1000; // 30 minutes
  const warningBefore = 60 * 1000; // 1 minute

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    clearTimeout(warningTimer);

    if (auth.currentUser) {
      warningTimer = setTimeout(showIdleWarning, idleLimit - warningBefore);
      idleTimer = setTimeout(handleAutoLogout, idleLimit);
    }
  }

  function showIdleWarning() {
    let remaining = warningBefore / 1000;
    let timerInterval;

    Swal.fire({
      title: "Anda tidak aktif",
      html: `Anda akan log keluar secara automatik dalam <b>${remaining}</b> saat jika tiada aktiviti.`,
      icon: "warning",
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: warningBefore,
      timerProgressBar: true,
      didOpen: () => {
        const content = Swal.getHtmlContainer()?.querySelector("b");
        if (content) {
            timerInterval = setInterval(() => {
                remaining--;
                content.textContent = remaining.toString();
                if (remaining <= 0) {
                    clearInterval(timerInterval);
                    Swal.close();
                    handleAutoLogout();
                }
            }, 1000);
        }
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        handleAutoLogout();
      }
    });

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    
    function closeWarningOnActivity() {
      Swal.close();
      resetIdleTimer();
      activityEvents.forEach(evt => window.removeEventListener(evt, closeWarningOnActivity));
    }

    activityEvents.forEach(evt => window.addEventListener(evt, closeWarningOnActivity, { once: true }));
  }

  function handleAutoLogout() {
    console.log("⏰ Idle timeout reached, logging out...");
    auth.logOut();

    Swal.fire({
      title: "Log Keluar",
      text: "Anda telah log keluar kerana tidak aktif.",
      icon: "info",
      confirmButtonText: "OK",
    }).then(() => {
      router.push("/login");
    });
  }

  const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];

  onMounted(() => {
    auth.validate();
    activityEvents.forEach((evt) => window.addEventListener(evt, resetIdleTimer));
    resetIdleTimer();
  });

  watch(
    () => auth.currentUser,
    (newUser) => {
      if (newUser) {
        resetIdleTimer();
      } else {
        clearTimeout(idleTimer);
        clearTimeout(warningTimer);
      }
    }
  );

  onUnmounted(() => {
    clearTimeout(idleTimer);
    clearTimeout(warningTimer);
    activityEvents.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
  });
}
