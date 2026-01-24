console.log("Users frontend javascript file");

$(function () {
  $(".member-status").on("change", (e) => {
    const id = e.target.id;
    // console.log("id:", id);

    const memberStatus = $(`#${id}.member-status`).val();
    console.log("memberStatus:", memberStatus);

    axios
      .post("/admin/users/edit", {
        _id: id,
        memberStatus: memberStatus,
      })
      .then((response) => {
        // console.log("response:", response);
        const result = response.data;
        // console.log("result:", result);

        if (result.data) {
          console.log("User updated!");
          $(`#${id}.member-status`).blur();
        } else alert("User update failed!");
      })
      .catch((err) => {
        console.log(err);
        alert("User update failed!");
      });
  });
});
