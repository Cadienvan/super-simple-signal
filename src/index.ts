import Signal from "./Signal";
import Computed from "./Computed";

declare global {
  interface Window {
    Signal: typeof Signal;
    Computed: typeof Computed;
  }
}

window.Signal = Signal;
window.Computed = Computed;
