function toggler(sel, toggleName="active") {
  if(Array.isArray(sel) && sel.every(v => v instanceof Element))
    sel.forEach(el => {
      el.addEventListener("click", () => {
        sel.filter(v => v.classList.contains(toggleName)).forEach(v => v.classList.toggle(toggleName));
        el.classList.toggle(toggleName);
      });
    });
  else document.querySelectorAll(sel).forEach(el => el.addEventListener("click", () => el.classList.toggle(toggleName)));
}

toggler("button.toggle-btn");

[...document.querySelectorAll('.yex'), ...document.querySelectorAll('a#github-link')].forEach(v => {
  v.href = "https://github.com/" + location.hostname.substring(0, location.hostname.indexOf('.'));
});

if(['iPad Simulator','iPhone Simulator','iPod Simulator','iPad','iPhone','iPod'].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)) {
  document.querySelector("div.has-dropdown").setAttribute('tabindex', '0');
  document.querySelectorAll("div.has-dropdown *").forEach(v => {
    v.setAttribute('tabindex', '0');
  });
}

const themeButtons = Array.from(document.querySelectorAll(".dropdown-item button"));

if("theme-color" in localStorage) { 
  document.documentElement.style.setProperty("--theme-clr", localStorage.getItem("theme-color"));
  themeButtons.forEach(value => {
    if(value.getAttribute("data-color") === localStorage.getItem("theme-color") || localStorage.getItem("theme-color").startsWith("#") && value.hasAttribute("data-custom")) {
      if(localStorage.getItem("theme-color").startsWith("#") && value.hasAttribute("data-custom")) value.parentElement.querySelector("input[type=color]").value = localStorage.getItem("theme-color");
      value.classList.add("active"); 
    } else if(value.classList.contains("active")) 
      value.classList.remove("active");
  });
}
document.querySelector("button#settings + ul.dropdown").style.top = document.querySelector("header:has(nav)").getBoundingClientRect().height + 'px';
document.querySelector("button#settings + ul.dropdown").style.left = document.querySelector("button#settings").getBoundingClientRect().left + 'px';
window.matchMedia("only screen and ( max-width: 550px )").addEventListener("change", () => document.querySelector("button#settings + ul.dropdown").style.top = document.querySelector("header:has(nav)").getBoundingClientRect().bottom + 'px')
window.addEventListener("resize", () => document.querySelector("button#settings + ul.dropdown").style.left = document.querySelector("button#settings").getBoundingClientRect().left + 'px');
document.querySelector("button#settings").addEventListener("click", () => document.querySelector("button#settings + ul.dropdown").classList.toggle("open"));

toggler(themeButtons);

themeButtons.forEach(button => {
  button.onclick = () => {
    if(button.hasAttribute("data-custom")) {
      button.parentElement.querySelector("input[type=color]").showPicker?.();
      document.documentElement.style.setProperty("--theme-clr", button.parentElement.querySelector("input[type=color]").value);
      localStorage.setItem("theme-color", button.parentElement.querySelector("input[type=color]").value);
      button.parentElement.querySelector("input[type=color]").oninput = function(e) {
        document.documentElement.style.setProperty("--theme-clr", e.target.value);
        localStorage.setItem("theme-color", e.target.value);
      };
    } else {
      document.documentElement.style.setProperty("--theme-clr", button.getAttribute("data-color"));
      localStorage.setItem("theme-color", button.getAttribute("data-color"));
    }
  };
});

tippy('[data-tippy-content]', {
      arrow: false,
      theme: 'darker',
      offset: [0, 5],
      placement: "bottom"
});