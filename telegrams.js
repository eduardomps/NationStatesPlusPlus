(function() {
	if (isSettingEnabled("clickable_telegram_links")) {
		linkifyTelegrams();
	}

	function linkifyTelegrams() {
		if (getVisiblePage() == "telegrams" || getVisiblePage() == "tg") {
			$(".tgcontent").children("p").each(function() {
				if ($(this).attr('class') != "replyline") {
					$(this).html(linkify($(this).html()));
				}
			});
		}
	}
})();