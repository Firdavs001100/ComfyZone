console.log("Signup frontend javascript file");

$(function () {
  const fileTarget = $(".file-box .upload-hidden");
  let filename;

  fileTarget.on("change", function () {
    if (window.FileReader) {
      const uploadFile = $(this)[0].files[0],
        fileType = uploadFile["type"],
        validImageType = ["image/jpeg", "image/jpg", "image/png"];
      if (!validImageType.includes(fileType)) {
        alert("Please upload image only wih a format of jpeg, jpg or png");
      } else {
        if (uploadFile) {
          const newSrcURL = URL.createObjectURL(uploadFile);
          //   console.log(newSrcURL);
          $(".upload-img-frame").attr("src", newSrcURL).addClass("success");
        }
        filename = $(this)[0].files[0].name;
      }
      $(this).siblings(".upload-name").val(filename);
    }
  });
});

function validateSignupForm() {
  const memberNick = $(".member-nick").val(),
    memberPhone = $(".member-phone").val(),
    memberPassword = $(".member-password").val(),
    confirmPassword = $(".confirm-password").val();

  if (
    memberNick === "" ||
    memberPhone === "" ||
    memberPassword === "" ||
    confirmPassword === ""
  ) {
    alert("Please insert all required inputs");
    return false;
  }

  if (memberPassword !== confirmPassword) {
    alert("Your passwords differ, please check it again!");
    return false;
  }

  const memberImage = $(".member-image").get(0).files[0]
    ? $(".member-image").get(0).files[0].name
    : null;

  if (!memberImage) {
    alert("Please insert restaurant image!");
    return false;
  }

  return true;
}
