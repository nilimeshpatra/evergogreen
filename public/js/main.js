/**
 * @copyright 2024 Nilimesh Patra
 *
 * This file is part of the EverGoGreen project.
 *
 * This Project is licensed under the MIT License.
 * See the LICENSE file for more information.
 */
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function logout() {
  setCookie("token", "", -1);
}

async function getUser() {
  const token = getCookie("token");

  if (token) {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        Authorization: token,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      setCookie("token", "", -1);
      return null;
    }

    return json;
  }

  return null;
}

(async () => {
  "use strict";

  const navbarSupportedContent = document.getElementById("navbarSupportedContent");

  if (navbarSupportedContent == null) {
    return;
  }

  const togglerIcon = document.querySelector(".navbar-toggler-icon");

  navbarSupportedContent.addEventListener("show.bs.collapse", (event) => {
    togglerIcon.classList.remove("opacity-50");
  });

  navbarSupportedContent.addEventListener("hide.bs.collapse", (event) => {
    togglerIcon.classList.add("opacity-50");
  });
})();
