$(window).on("resize", function() {
  if($(window).width() > 1919) {
    $("#content-container").removeClass("container-fluid");
    $("#content-container").addClass("container");
    console.log("larger than");
  } else {
    $("#content-container").removeClass("container");
    $("#content-container").addClass("container-fluid");
    console.log("smaller than");
  }
})

// $("#mySelect option: first").attr("selected", "selected");
