/**
 * @copyright 2024 Nilimesh Patra
 *
 * This file is part of the EverGoGreen project.
 *
 * This Project is licensed under the MIT License.
 * See the LICENSE file for more information.
 */
function deleteEntry(id) {
  const token = getCookie("token");
  
  if (token == "") {
    window.location.href = "login.html";
    return;
  }
  
  fetch(`/api/vhi/delete/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  })
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      document.getElementById(id).remove();
    }
    alert(data.message);
  })
  .catch((err) => console.error(err.message));
}

(async () => {
  "use strict";

  const data = await getUser();

  if (data == null) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("name").innerHTML = data.user.name;
  document.getElementById("welcome").innerHTML = `Welcome, ${data.user.name}!`;

  await loadVhiList();

  let locationValid = false;
  let dateValid = false;
  let vegetationValid = false;

  const location = document.getElementById("location");
  const locationError = document.getElementById("locationError");

  location.addEventListener("input", (event) => {
    const value = location.value;
    if (value == null || value == "") {
      location.classList.add("is-invalid");
      locationError.innerHTML = "Location is required";
      locationValid = false;
    } else if (value.length < 5 || value.length > 30) {
      location.classList.add("is-invalid");
      locationError.innerHTML = "Location must be between 5 and 30 characters";
      locationValid = false;
    } else {
      location.classList.remove("is-invalid");
      locationValid = true;
    }
  });

  const vhiValue = document.getElementById("vhi_value");
  const vhiError = document.getElementById("vhiError");
  const date = document.getElementById("date");
  const dateError = document.getElementById("dateError");
  let dateValue;

  date.addEventListener("input", (event) => {
    dateValue = date.value;
    if (dateValue != null && dateValue != "") {
      dateValue = dateValue.split("-");
      dateValue = `${dateValue[2]}-${dateValue[1]}-${dateValue[0]}`;
    }
    const parsedDate = new Date(dateValue);
    if (isNaN(parsedDate.getTime())) {
      date.classList.add("is-invalid");
      dateError.innerHTML = "Invalid date";
      dateValid = false;
    } else {
      date.classList.remove("is-invalid");
      dateValid = true;
    }
  });

  const vegetationType = document.getElementById("vegetation_type");
  const vegetationError = document.getElementById("vegetationError");

  vegetationType.addEventListener("input", (event) => {
    const value = vegetationType.value;
    if (value == null || value == "") {
      vegetationType.classList.add("is-invalid");
      vegetationError.innerHTML = "Vegetation is required";
      vegetationValid = false;
    } else {
      vegetationType.classList.remove("is-invalid");
      vegetationValid = true;
    }
  });

  const addBtn = document.getElementById("add-btn");
  addBtn.addEventListener("click", async (event) => {
    if (locationValid && dateValid && vegetationValid) {
      const token = getCookie("token");

      if (token == "") {
        window.location.href = "login.html";
        return;
      }

      const data = {
        location: location.value,
        vhi_value: vhiValue.value,
        date: dateValue,
        vegetation_type: vegetationType.value,
      };

      const res = await fetch("/api/vhi/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok) {
        await loadVhiList();
      } else {
        json.errors.forEach((err) => {
          switch (err.field) {
            case "location":
              location.classList.add("is-invalid");
              locationError.innerHTML = err.message;
              break;
            case "vhi_value":
              vhiValue.classList.add("is-invalid");
              vhiError.innerHTML = err.message;
              break;
            case "date":
              date.classList.add("is-invalid");
              dateError.innerHTML = err.message;
              break;
            case "vegetation_type":
              vegetationType.classList.add("is-invalid");
              vegetationError.innerHTML = err.message;
              break;
          }
        });
      }
    } else {
      if (!locationValid) {
        location.classList.add("is-invalid");
      }

      if (!dateValid) {
        date.classList.add("is-invalid");
      }

      if (!vegetationValid) {
        vegetationType.classList.add("is-invalid");
      }
    }
  });

  async function loadVhiList() {
    const res = await fetch("/api/vhi");
    const json = await res.json();

    const vhiList = document.getElementById("vhi-list");

    if (!json.vhi_list || json.vhi_list.length == 0) {
      vhiList.innerHTML = `
        <tr>
          <td class="text-center" colspan="5">No Entry Found. Add an entry to see entry.<td>
        </tr>
      `;
      return;
    }

    let list = "";
    let button = "";
    json.vhi_list.forEach((vhi) => {
      const { id, author, location, vhi_value, date, vegetation_type } = vhi;
      if (author == data.user.id) {
        button = `<td><button type="button" class="btn btn-sm btn-danger" onclick="deleteEntry(${id})">Delete</button><td>`;
      }
      list += `
        <tr id=${id}>
          <td>${id}</td>
          <td>${location}</td>
          <td>${vhi_value}</td>
          <td>${date}</td>
          <td>${vegetation_type}</td>
          ${button}
        </tr>
      `;
    });

    vhiList.innerHTML = list;
  }
})();
