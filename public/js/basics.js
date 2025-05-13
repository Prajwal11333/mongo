 $(".Introdropdown1,.Introdropdown2,.Introdropdown3").hide();
                $(".section-1").on("click", function () {
                    $(".Introdropdown1").toggle();
                });
                $(".section-2").on("click", function () {
                    $(".Introdropdown2").toggle();
                });
                $(".section-3").on("click", function () {
                    $(".Introdropdown3").toggle();
                });
                
                $(document).ready(function () {
                    $(".common").on("click", function () {
                        const videoId = $(this).data("id");
                        
                        $.ajax({
                            url: `/tutorials/basics/${videoId}`,
                            type: 'GET',
                            dataType: 'json',
                            success: function(data) {
                                // Update video source and title
                                $(".anchor video source").attr("src", data.videos.video);
                                $(".anchor h2").text(data.videos.title);
                                
                                // Important: Need to reload the video element after changing source
                                $(".anchor video")[0].load();
                                $(".anchor video")[0].play();
                            },
                            error: function(err) {
                                console.error("Error loading video:", err);
                            }
                        });
                    });
                });
