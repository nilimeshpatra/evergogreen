/**
 * @copyright 2024 Nilimesh Patra
 *
 * This file is part of the EverGoGreen project.
 *
 * This Project is licensed under the MIT License.
 * See the LICENSE file for more information.
 */
(async () => {
  "use strict";

  if (await getUser()) {
    window.location.href = "dashboard.html";
    return;
  }

  let usernameValid = false;
  let passwordValid = false;

  const username = document.getElementById("username");
  const usernameError = document.getElementById("usernameError");

  username.addEventListener("input", (event) => {
    const value = username.value;
    if (value == null || value == "") {
      username.classList.add("is-invalid");
      usernameError.innerHTML = "Username is required";
      usernameValid = false;
    } else {
      username.classList.remove("is-invalid");
      usernameValid = true;
    }
  });

  const password = document.getElementById("password");
  const passwordError = document.getElementById("passwordError");

  password.addEventListener("input", (event) => {
    const value = password.value;
    if (value == null || value == "") {
      password.classList.add("is-invalid");
      passwordError.innerHTML = "Password is required";
      passwordValid = false;
    } else {
      password.classList.remove("is-invalid");
      passwordValid = true;
    }
  });

  const loginBtn = document.getElementById("login-btn");

  loginBtn.addEventListener("click", async (event) => {
    if (usernameValid && passwordValid) {
      const data = {
        username: username.value,
        password: password.value,
      };

      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok) {
        if (getCookie("token") == "") {
          setCookie("token", json.token, 1 / 24);
        }
        window.location.href = "dashboard.html";
      } else if (json.errors) {
        json.errors.forEach((err) => {
          switch (err.field) {
            case "username":
              username.classList.add("is-invalid");
              usernameError.innerHTML = err.message;
              break;
            case "password":
              password.classList.add("is-invalid");
              passwordError.innerHTML = err.message;
              break;
          }
        });
      } else {
        document.getElementById('invalid').classList.remove("d-none");
      }
    } else {
      if (!usernameValid) {
        username.classList.add("is-invalid");
      }

      if (!passwordValid) {
        password.classList.add("is-invalid");
      }
    }
  });
})();
