// globalState.js
window.globalModalState = {
    showModal: false,
    openModal: function () {
      this.showModal = true;
      document.dispatchEvent(new CustomEvent("modalStateChanged"));
    },
    closeModal: function () {
      this.showModal = false;
      document.dispatchEvent(new CustomEvent("modalStateChanged"));
    },
  };
      