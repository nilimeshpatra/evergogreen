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

  let nameValid = false;
  let addressValid = false;
  let emailValid = false;
  let usernameValid = false;
  let passwordValid = false;

  const name = document.getElementById("name");
  const nameError = document.getElementById("nameError");

  name.addEventListener("input", (event) => {
    const value = name.value;
    if (value == null || value == "") {
      name.classList.add("is-invalid");
      nameError.innerHTML = "Name is required";
      nameValid = false;
    } else if (value.length < 2 || value.length > 50) {
      name.classList.add("is-invalid");
      nameError.innerHTML = "Name must be between 2 and 50 characters";
      nameValid = false;
    } else {
      name.classList.remove("is-invalid");
      nameValid = true;
    }
  });

  const address = document.getElementById("address");
  const addressError = document.getElementById("addressError");

  address.addEventListener("input", (event) => {
    const value = address.value;
    if (value == null || value == "") {
      address.classList.add("is-invalid");
      addressError.innerHTML = "Address is required";
      addressValid = false;
    } else if (value.length < 5 || value.length > 255) {
      address.classList.add("is-invalid");
      addressError.innerHTML = "Address must be between 5 and 255 characters";
      addressValid = false;
    } else {
      address.classList.remove("is-invalid");
      addressValid = true;
    }
  });

  const email = document.getElementById("email");
  const emailError = document.getElementById("emailError");

  email.addEventListener("input", (event) => {
    const value = email.value;
    if (value == null || value == "") {
      email.classList.add("is-invalid");
      emailError.innerHTML = "Email is required";
      emailValid = false;
    } else if (email.validity.typeMismatch) {
      email.classList.add("is-invalid");
      emailError.innerHTML = "Invalid email format";
      emailValid = false;
    } else {
      email.classList.remove("is-invalid");
      emailValid = true;
    }
  });

  const username = document.getElementById("username");
  const usernameError = document.getElementById("usernameError");

  username.addEventListener("input", (event) => {
    const value = username.value;
    if (value == null || value == "") {
      username.classList.add("is-invalid");
      usernameError.innerHTML = "Username is required";
      usernameValid = false;
    } else if (value.length < 2 || value.length > 32) {
      username.classList.add("is-invalid");
      usernameError.innerHTML = "Username must be between 2 and 32 characters";
      usernameValid = false;
    } else if (!/^[.\w]+$/.test(value)) {
      username.classList.add("is-invalid");
      usernameError.innerHTML = "Username can contain only underscores, periods, and alphanumeric characters";
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
    } else if (value.length < 8 || value.length > 32) {
      password.classList.add("is-invalid");
      passwordError.innerHTML = "Password must be between 8 and 32 characters";
      passwordValid = false;
    } else if (!validatePassword(value)) {
      password.classList.add("is-invalid");
      passwordError.innerHTML = "Password must be strong (containing uppercase and lowercase letters, numbers, and special characters)";
      passwordValid = false;
    } else {
      password.classList.remove("is-invalid");
      passwordValid = true;
    }
  });

  function validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    return isValid;
  }

  const registerBtn = document.getElementById("register-btn");

  registerBtn.addEventListener("click", async (event) => {
    if (nameValid && addressValid && emailValid && usernameValid && passwordValid) {
      const data = {
        name: name.value,
        address: address.value,
        email: email.value,
        username: username.value,
        password: password.value,
      };

      const res = await fetch("/api/users/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok) {
        window.location.href = "login.html";
      } else {
        json.errors.forEach((err) => {
          switch (err.field) {
            case "name":
              name.classList.add("is-invalid");
              nameError.innerHTML = err.message;
              break;
            case "address":
              address.classList.add("is-invalid");
              addressError.innerHTML = err.message;
              break;
            case "email":
              email.classList.add("is-invalid");
              emailError.innerHTML = err.message;
              break;
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
      }
    } else {
      if (!nameValid) {
        name.classList.add("is-invalid");
      }

      if (!addressValid) {
        address.classList.add("is-invalid");
      }

      if (!emailValid) {
        email.classList.add("is-invalid");
      }

      if (!usernameValid) {
        username.classList.add("is-invalid");
      }

      if (!passwordValid) {
        password.classList.add("is-invalid");
      }
    }
  });
})();
