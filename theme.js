if("theme-color" in localStorage) { 
  document.documentElement.style.setProperty("--theme-clr", localStorage.getItem("theme-color"));
}