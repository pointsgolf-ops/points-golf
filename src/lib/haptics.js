export function haptic() {
    if (typeof window === "undefined") return;
  
    if (navigator.vibrate) {
      navigator.vibrate(12);
    }
  }