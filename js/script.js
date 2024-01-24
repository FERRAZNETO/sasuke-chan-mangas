jQuery(function ($) {
    $('[data-toggle="tooltip"]').tooltip();
    const offCanvasMenuToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        var $this = $(e.target).parent();
        $this.toggleClass("active").children("ul").slideToggle(200);
        return false;
    };
    $(".off-canvas ul >li.menu-item-has-children > a").unbind("click").unbind("touchend");
    $(".off-canvas ul >li.menu-item-has-children > a").on("click", offCanvasMenuToggle).on("touchend", offCanvasMenuToggle);
    if (!$("body").hasClass("logged-in")) {
        const doesUrlContainsHash = (url, hashName) => {
            return url.length - url.indexOf(hashName) - hashName.length == 0;
        };
        [
            { id: "#form-login", ref: "#login" },
            { id: "#form-sign-up", ref: "#signup" },
            { id: "#form-reset", ref: "#lostpassword" },
        ].forEach((formModal) => {
            let $formModal = $(formModal.id);
            if (doesUrlContainsHash(window.location.href, formModal.ref)) {
                $(document).ready(function () {
                    $formModal.modal("show");
                });
            }
            $formModal
                .on("show.bs.modal", function () {
                    let currentUrl = window.location.href;
                    if (!doesUrlContainsHash(currentUrl, formModal.ref)) {
                        window.history.replaceState(null, "", currentUrl + formModal.ref);
                    }
                })
                .on("hide.bs.modal", function () {
                    let currentUrl = window.location.href;
                    if (doesUrlContainsHash(currentUrl, formModal.ref)) {
                        window.history.replaceState(null, "", currentUrl.split("#")[0]);
                    }
                });
        });
    }
    if ($(".c-header__top .manga-search-form").length !== 0 && $(".c-header__top .manga-search-form.search-form").length !== 0) {
        $("form#blog-post-search").addClass("manga-search-form");
        $('form#blog-post-search input[name="s"]').addClass("manga-search-field-ajax");
        $("form.manga-search-form.ajax input.manga-search-field-ajax").each(function () {
            var searchIcon = $(this).parent().children(".ion-ios-search-strong");
            var append = $(this).parent();
            $(this)
                .autocomplete({
                    appendTo: append,
                    source: function (request, resp) {
                        $.ajax({
                            url: manga.ajax_url,
                            type: "GET",
                            dataType: "json",
                            data: { action: "wp-manga-search-manga", title: request.term },
                            success: function (data) {
                                resp(
                                    $.map(data.data, function (item) {
                                        return { value: item.title, click: item.url ? true : false, ...item };
                                    })
                                );
                            },
                        });
                    },
                    select: function (e, ui) {
                        if (ui.item.url) {
                            window.location.href = ui.item.url;
                        } else {
                            if (ui.item.click) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    },
                    open: function (e, ui) {
                        var acData = $(this).data("uiAutocomplete");
                        acData.menu.element
                            .addClass("manga-autocomplete")
                            .find("li .result-title")
                            .each(function () {
                                var $self = $(this),
                                    keyword = $.trim(acData.term).split(" ").join("|");
                                $self.html($self.text().replace(new RegExp("(" + keyword + ")", "gi"), '<span class="manga-text-highlight">$1</span>'));
                            });
                    },
                })
                .autocomplete("instance")._renderItem = function (ul, item) {
                let html;
                if (item.url) {
                    switch (item.result_type) {
                        case "manga":
                            html = renderMangaResultItem(item);
                            break;
                        case "tag":
                            html = renderTagResultItem(item);
                            break;
                    }
                } else {
                    html = renderGroupNameItem(item);
                }
                return $(html).appendTo(ul);
            };
        });
        function highlightKeyword(title, keyword) {
            let result = title.replace(new RegExp(`(${keyword})`, "gi"), '<span class="manga-text-highlight">$1</span>');
            return result;
        }
        function renderMangaResultItem(item) {
            let $item = $(`<li class="search-item">
				<div class="manga-type-${item.type} result-item">
					<div class="item-thumb"><img src="${item.thumb ? item.thumb : ""}"/></div>
					<div class="item-titles">
						<div class="manga-title result-title"></div>
						<div class="sub-title result-title"></div>
					</div>
				</div>
			</li>`);
            $item.find(".manga-title").html(highlightKeyword(item.title));
            if (item.alt_title) {
                $item.find(".sub-title").html(highlightKeyword(item.alt_title));
            }
            return $item;
        }
        function renderTagResultItem(item) {
            let $item = $(`<li class="search-item">
				<div class="result-item">
					<div class="tag-item">
						${item.icon} <span class="result-title"></span>
					</div>
				</div>
			</li>`);
            $item.find(".result-title").html(item.title);
            return $item;
        }
        function renderGroupNameItem(item) {
            return `<li class="search-item-group-name">${item.title}</li>`;
        }
    }
    $(document).ready(() => {
        $(".wp-pagenavi .page + .extend:not(:last-of-type)").click((e) => {
            e.preventDefault();
            let page;
            let isValid = false;
            let [match, curPage, lastPage] = /Page (\w+) of (.+)/.exec($(".wp-pagenavi .pages").text());
            lastPage = parseInt(lastPage.replaceAll(/\D/g, ""));
            do {
                page = prompt("Jump page to?");
                if (page) {
                    page = parseInt(page);
                    if (isNaN(page)) {
                        alert("Invalid page number, please try again");
                    } else if (page > lastPage) {
                        alert(`You can jump to page larger than ${lastPage}`);
                    } else if (page < 1) {
                        alert(`You can jump to page smaller than 1`);
                    } else {
                        isValid = true;
                    }
                } else {
                    return;
                }
            } while (!isValid);
            let [baseUrl, queryStr] = window.location.href.split("?");
            baseUrl = baseUrl.replace(/\/?(page(\/\d+)?)?(\/)?$/, "");
            window.location.href = `${baseUrl}/page/${page}/${queryStr ? "?" + queryStr : ""}`;
        });
    });
});

  function changeIcon(element) {
    element.innerHTML = "<i class='bx bx-sort-down'></i>";
  }
  
  function resetIcon(element) {
    element.innerHTML = "<i class='bx bx-sort-up'></i>";
  }

$(document).ready(function() {
  var currentIndex = 0; // Current index of the divs to show
  var divsPerPage = 10; // Number of divs to display per click

  // Show the initial set of divs
  showDivs();

  // Handle click event on "MORE UPDATES" link
  $('.more a').on('click', function(e) {
    e.preventDefault();

    // Show the next set of divs
    showDivs();
  });

  // Function to show the next set of divs
  function showDivs() {
    var totalDivs = $('.capitulo_recentehome').length; // Total number of divs

    // Calculate the index range for the next set of divs
    var endIndex = currentIndex + divsPerPage;
    endIndex = (endIndex > totalDivs) ? totalDivs : endIndex;

    // Show the divs within the range
    for (var i = currentIndex; i < endIndex; i++) {
      $('.capitulo_recentehome').eq(i).css('display', 'block');
    }

    // Update the current index for the next click
    currentIndex = endIndex;

    // Replace the "MORE UPDATES" button with a link if all divs have been shown
    if (currentIndex >= totalDivs) {
      var url = 'https://lermanga.org/capitulos/';
      var link = $('<a></a>').attr('href', url).text('VER TODAS').addClass('more-link');
      $('.more').empty().append(link);
    }
  }
});