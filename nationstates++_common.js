(function() {
	//Add $.changeElementType
	(function($) {
		$.fn.changeElementType = function(newType) {
			var attrs = {};

			$.each(this[0].attributes, function(idx, attr) {
				attrs[attr.nodeName] = attr.nodeValue;
			});

			this.replaceWith(function() {
				return $("<" + newType + "/>", attrs).append($(this).contents());
			});
		};
	})(jQuery);

	(function($) {
		$.fn.toggleDisabled = function(){
			return this.each(function(){
				this.disabled = !this.disabled;
			});
		};
	})(jQuery);

	//Add string.startsWith
	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (str){
			return this.slice(0, str.length) == str;
		};
	}

	//Add string.contains
	if (typeof String.prototype.contains != 'function') {
		String.prototype.contains = function (str){
			return this.indexOf(str) != -1;
		};
	}

	//Add string.toTitleCase
	if (typeof String.prototype.toTitleCase != 'function') {
		String.prototype.toTitleCase = function (){
			return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		};
	}

	//Add escape
	RegExp.escape = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}

	//Add replaceAll
	String.prototype.replaceAll = function(search, replace) {
		return this.replace(new RegExp(RegExp.escape(search),'g'), replace);
	};

	(function ($) {
		$.fn.get_selection = function () {
			var e = this.get(0);
			//Mozilla and DOM 3.0
			if('selectionStart' in e) {
				var l = e.selectionEnd - e.selectionStart;
				return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
			}
			else if(document.selection) {		//IE
				e.focus();
				var r = document.selection.createRange();
				var tr = e.createTextRange();
				var tr2 = tr.duplicate();
				tr2.moveToBookmark(r.getBookmark());
				tr.setEndPoint('EndToStart',tr2);
				if (r == null || tr == null) return { start: e.value.length, end: e.value.length, length: 0, text: '' };
				var text_part = r.text.replace(/[\r\n]/g,'.'); //for some reason IE doesn't always count the \n and \r in length
				var text_whole = e.value.replace(/[\r\n]/g,'.');
				var the_start = text_whole.indexOf(text_part,tr.text.length);
				return { start: the_start, end: the_start + text_part.length, length: text_part.length, text: r.text };
			}
			//Browser not supported
			else return { start: e.value.length, end: e.value.length, length: 0, text: '' };
		};

		$.fn.set_selection = function (start_pos,end_pos) {
			var e = this.get(0);
			//Mozilla and DOM 3.0
			if('selectionStart' in e) {
				e.focus();
				e.selectionStart = start_pos;
				e.selectionEnd = end_pos;
			}
			else if (document.selection) { //IE
				e.focus();
				var tr = e.createTextRange();

				//Fix IE from counting the newline characters as two seperate characters
				var stop_it = start_pos;
				for (i=0; i < stop_it; i++) if( e.value[i].search(/[\r\n]/) != -1 ) start_pos = start_pos - .5;
				stop_it = end_pos;
				for (i=0; i < stop_it; i++) if( e.value[i].search(/[\r\n]/) != -1 ) end_pos = end_pos - .5;

				tr.moveEnd('textedit',-1);
				tr.moveStart('character',start_pos);
				tr.moveEnd('character',end_pos - start_pos);
				tr.select();
			}
			return this.get_selection();
		};

		$.fn.replace_selection = function (replace_str) {
			var e = this.get(0);
			selection = this.get_selection();
			var start_pos = selection.start;
			var end_pos = start_pos + replace_str.length;
			e.value = e.value.substr(0, start_pos) + replace_str + e.value.substr(selection.end, e.value.length);
			this.set_selection(start_pos,end_pos);
			return {start: start_pos, end: end_pos, length: replace_str.length, text: replace_str};
		};

		$.fn.wrap_selection = function (left_str, right_str, sel_offset, sel_length) {
			var the_sel_text = this.get_selection().text;
			var selection;
			if (the_sel_text[the_sel_text.length - 1] == " ") selection = this.replace_selection(left_str + the_sel_text.substring(0, the_sel_text.length - 2) + right_str + " ");
			else selection = this.replace_selection(left_str + the_sel_text + right_str );
			if(sel_offset !== undefined && sel_length !== undefined) 
				selection = this.set_selection(selection.start +	sel_offset, selection.start +	sel_offset + sel_length);
			else if(the_sel_text == '') 
				selection = this.set_selection(selection.start + left_str.length, selection.start + left_str.length);
			return selection;
		};
	}(jQuery));

//*** This code is copyright 2002-2003 by Gavin Kistner, !@phrogz.net
//*** It is covered under the license viewable at http://phrogz.net/JS/_ReuseLicense.txt
	if (typeof Date.prototype.customFormat != 'function') {
		Date.prototype.customFormat = function(formatString) {
			var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
			var dateObject = this;
			YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
			MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
			MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
			DD = (D=dateObject.getDate())<10?('0'+D):D;
			DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
			th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
			formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

			h=(hhh=dateObject.getHours());
			if (h==0) h=24;
			if (h>12) h-=12;
			hh = h<10?('0'+h):h;
			AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
			mm=(m=dateObject.getMinutes())<10?('0'+m):m;
			ss=(s=dateObject.getSeconds())<10?('0'+s):s;
			return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
		};
	}
//*** END OF LICENSED CODE BY GAVEN KISTNER ***//
	if (window.location.href.indexOf("?open_settings") != -1) {
		showSettings();
	}
	if (window.location.href.indexOf("forum.nationstates") == -1) {
		setupSyncing();
	}
	if (isSettingEnabled("show_puppet_switcher")) {
		$("#puppet_setting").show();
	}
	update(1);
})();

/**
	Converts a search input into an array of keywords to search for.
	Each word separated by one or more spaces is considered a keyword,
	Unless the text is inside a pair of ""'s.
*/
function searchToKeywords(search) {
	var keys = new Array();
	var start = 0;
	var foundQuote = false;
	for (var i = 0, len = search.length; i < len; i++) {
		if (search[i] == '"') {
			if (!foundQuote) {
				foundQuote = true;
			} else {
				foundQuote = false;
				keys.push(search.substring(start + 1, i).trim());
				start = i + 1;
			}
		} else if (search[i] == " " && !foundQuote) {
			if (i != start) {
				keys.push(search.substring(start, i).trim());
			}
			start = i + 1;
		}
	}
	var lastKey;
	if (foundQuote) {
		lastKey = search.substring(start + 1).trim();
	} else {
		lastKey = search.substring(start).trim();
	}
	if (lastKey.length > 0) {
		keys.push(lastKey);
	}
	return keys;
}

function showPuppets() {
	if (!isSettingEnabled("show_puppet_switcher")) {
		return;
	}
	if ($("#puppet_setting_form").length == 0) {
		$("#puppet_setting").append("<div id='puppet_setting_form' class='puppet-form'></div>");
		$("#puppet_setting_form").hover(function() { $("#puppet_setting_form").css('display', 'block').css('opacity', '.75'); }, function() { $("#puppet_setting_form").css('display', 'none'); });
	}
	$("#puppet_setting_form").css('opacity', '.75').show();
	var html = "<h3>Puppets</h3><ul>";
	var puppets = localStorage.getItem("puppets");
	if (puppets == null) puppets = "";
	var split = puppets.split(",");
	var numPuppets = 0;
	for (var i = 0; i < split.length; i++) {
		var name = split[i];
		if (name.length > 0) {
			var region = handleRegionCache(name);
			html += "<li><div class='puppet-form-inner' style='margin-bottom: -15px;'><p style='margin-top: 3px;'><a id='" + name + "' href='/nation=" + name + "' style='color: white;' onmouseover='showPuppetRegion(\"" + name + "\");' onclick='switchToPuppet(\"" + name + "\"); return false;'>" + name.split("_").join(" ").toTitleCase() + "</a></p><ul style='display:none;'><li id='puppet-region-" + name + "'>(<a style='color: white;' href='/region=" + region + "'>" + region.split("_").join(" ").toTitleCase() + "</a>)</li></ul></div><img class='puppet-form-remove' onclick='removePuppet(\"" + name + "\");' src='http://capitalistparadise.com/nationstates/static/remove.png'></img></li>";
			numPuppets++;
		}
	}
	if (numPuppets == 0) {
		html += "<li>There's nothing here...</li>";
	}
	html += "</ul>";
	html += "<p style='margin-top: -20px; margin-bottom: 1px;'><input id='puppet_nation' size='18' placeholder='Nation' onkeydown='if (event.keyCode == 13) { addPuppet(); }'></p>";
	html += "<p style='margin-top: 1px;'><input type='password' id='puppet_password' size='18' placeholder='Password' onkeydown='if (event.keyCode == 13) { addPuppet(); }'></p>";
	
	var labelStyle = "style='font-size: 13px; line-height: 13px; vertical-align: text-top;'";
	html += "<div style='margin-left: -27px; margin-top: -10px;'><input id='redirect-puppet-page' title='When you login, you will be redirected to the nation page of the puppet' class='indent' type='checkbox'><label title='When you login, you will be redirected to the nation page of the puppet' " + labelStyle + " for='redirect-puppet-page'>Redirect to Nation Page</label></div>"
	html += "<div style='margin-left: -34px; padding-bottom: 5px;'><input id='show-region-on-hover' title='Hovering over the name of a puppet reveals which region it is in' class='indent' type='checkbox'><label title='Hovering over the name of a puppet reveals which region it is in' " + labelStyle + " for='show-region-on-hover'>Show regions on hover</label></div>"
	html += "<div id='puppet_invalid_login' style='display:none;'><p>Invalid Login</p></div>";

	$("#puppet_setting_form").html(html);

	setupPuppetSetting("redirect-puppet-page");
	setupPuppetSetting("show-region-on-hover");
}

function setupPuppetSetting(setting) {
	$("#" + setting).on('click', function() {
		if (localStorage.getItem(setting) == "true") {
			localStorage.removeItem(setting);
		} else {
			localStorage.setItem(setting, "true")
		}
		$("#" + setting).prop("checked", localStorage.getItem(setting) == "true");
	});
	$("#" + setting).prop("checked", localStorage.getItem(setting) == "true");
}

function handleRegionCache(name) {
	var regionNameCache = localStorage.getItem("puppet-" + name + "-region");
	if (regionNameCache != null) {
		var cache = JSON.parse(regionNameCache);
		if (parseInt(regionNameCache['timestamp']) > Date.now()) {
			return cache['region'];
		}
	}
	$.get("/nation=" + name, function(data) {
		var region = $(data).find(".rlink:first").attr('href').substring(7);
		$("#puppet-region-" + name).html("(<a style='color: white;' href='/region=" + region + "'>" + region.split("_").join(" ").toTitleCase() + "</a>)");
		var cache = new Object();
		cache['region'] = region;
		cache['timestamp'] = (Date.now() + 24 * 60 * 60 * 1000);
		localStorage.setItem("puppet-" + name + "-region", JSON.stringify(cache));
	});
	return "";
}

function showPuppetRegion(name) {
	if (localStorage.getItem("show-region-on-hover") == "true") {
		if (!$("#puppet-region-" + name).parent().is(":visible")) {
			$("#puppet-region-" + name).parent().animate({ height: 'toggle' }, 500);
		}
	}
}

function switchToPuppet(name) {
	localStorage.removeItem("puppet-" + name + "-region");
	$.post("http://www.nationstates.net/", "logging_in=1&nation=" + encodeURIComponent(name) + "&password=" + encodeURIComponent(localStorage.getItem("puppet-" + name)), function(data) {
		if (localStorage.getItem("redirect-puppet-page") == "true") {
			window.location.href = "/nation=" + name;
		} else {
			window.location.reload(false);
		}
	});
}

function removePuppet(name) {
	var puppets = localStorage.getItem("puppets");
	if (puppets == null) puppets = "";
	var split = puppets.split(",");
	var newPuppets = "";
	for (var i = 0; i < split.length; i++) {
		if (split[i] != name && split[i].length > 0) {
			if (newPuppets.length > 0) {
				newPuppets += ",";
			}
			newPuppets += split[i];
		}
	}
	localStorage.setItem("puppets", newPuppets);
	localStorage.removeItem("puppet-" + name);
	showPuppets();
}

function addPuppet() {
	var nationName = $("#puppet_nation");
	var nationPassword = $("#puppet_password");
	if (nationName.val() == "" || nationPassword.val() == "") {
		$("#puppet_invalid_login").show();
		return;
	}
	var formattedName = nationName.val().toLowerCase().split(" ").join("_");
	localStorage.setItem("puppet-" + formattedName, nationPassword.val());
	var puppets = localStorage.getItem("puppets");
	if (puppets == null) puppets = "";
	var split = puppets.split(",");
	var found = false;
	for (var i = 0; i < split.length; i++) {
		if (split[i] == formattedName) {
			found = true;
			break;
		}
	}
	if (!found) {
		if (puppets.length != 0) {
			puppets += ",";
		}
		localStorage.setItem("puppets", puppets + formattedName);
	}
	showPuppets();
	$("#puppet_nation").focus();
}

function showSettings() {
	localStorage.removeItem("next_sync" + getUserNation());
	if ($("#nationstates_settings").length == 0) {
		var forums = $("#wrap").length == 1;
		$.get("http://capitalistparadise.com/nationstates/v1_9/" + (forums ? "forum_" : "region_") + "settings.html", function(data) {
			if (forums) {
				var html = $("#wrap").html();
				var classes = $("#wrap").attr('class');
				$("#wrap").remove();
				$("<div id='main'><div id='wrap' class='" + classes + "'>" + html + "</div></div>").insertAfter("#nssidebar, #nstopbar");
			} else if (isAntiquityTheme()) {
				var html = $("#main").html();
				$("#main").remove();
				$("<div id='main'><div id='wrap'>" + html + "</div></div>").insertAfter("#banner");
			}
			$("#main").html($("#main").html() + "<div id='nationstates_settings'><div>");
			$("#nationstates_settings").html(data);
			if (isAntiquityTheme() && !forums) {
				$("#nationstates_settings").css("margin-left", "0");
			}
			$("#nationstates_settings").hide();
			$("#nationstates_settings").find('input').each(function() {
				$(this).prop("checked", isSettingEnabled($(this).prop("id")));
			});
			if (!$("#forum_enhancements").prop("checked")) {
				$("#forum_enhancements_form").find('input').toggleDisabled();
			}
			if (!$("#region_enhancements").prop("checked")) {
				$("#region_enhancements_form").find('input').toggleDisabled();
			}
			if (!$("#telegram_enhancements").prop("checked")) {
				$("#telegram_enhancements_form").find('input').toggleDisabled();
			}
			$("#region_enhancements").on('click', function() {
				$("#region_enhancements_form").find('input').toggleDisabled();
			});
			$("#forum_enhancements").on('click', function() {
				$("#forum_enhancements_form").find('input').toggleDisabled();
			});
			$("#telegram_enhancements").on('click', function() {
				$("#telegram_enhancements_form").find('input').toggleDisabled();
			});
			$("#save_button").on("click", function() {
				$("#nationstates_settings").find('input').each(function() {
					localStorage.setItem($(this).prop("id"), $(this).prop("checked"));
				});
				localStorage.setItem("settings-timestamp", Date.now());
				$("#nationstates_settings").hide();
				$("#content, #wrap").show();
				location.reload();
			});
			$("#reset_button").on("click", function() {
				$("#nationstates_settings").find('input').prop("checked", true);
				$("#autologin_to_regional_irc").prop("checked", false);
			});
			$("#cancel_button").on("click", function() {
				$("#nationstates_settings").find('input').each(function() {
					$(this).prop("checked", isSettingEnabled($(this).prop("id")));
				});
				$("#nationstates_settings").hide();
				$("#content, #wrap").show();
			});
			showSettings();
		});
	} else {
		$("#content, #wrap").hide();
		$("#nationstates_settings").show();
	}
	return false;
}

var _progress_label
function setupSyncing() {
	if (getUserNation() == "") {
		return;
	}
	localStorage.removeItem("next_sync" + getUserNation());
	var nextSync = localStorage.getItem("next_sync_" + getUserNation());
	if (nextSync == null || nextSync < Date.now()) {
		localStorage.setItem("next_sync_" + getUserNation(), Date.now() + 900 * 1000);
		if (typeof Firebase == "undefined") {
			console.log("waiting for firebase...");
			setTimeout(setupSyncing, 250);
			return;
		} else {
			console.log("Firebase ready!");
		}
		var banner = $("#banner, #nsbanner");
		var progressStyle = "right: 320px; position: absolute; top: 6px; width: 150px; height: 16px; background: rgba(255, 255, 255, 0.65);";
		$(banner).append("<div id='firebase_progress_bar' style='" + progressStyle + "' title='Syncing Settings...'><span id='progress_label' style='position: absolute; text-align: center; line-height: 1.5em; margin-left: 30px; font-size:10px; font-weight: bold;'>Syncing Settings</span></div>");
		$("#firebase_progress_bar" ).progressbar({value: 0});
		$("#firebase_progress_bar" ).hide();
		_progress_label = $("#firebase_progress_bar").find('#progress_label').clone().width($("#firebase_progress_bar").width());
		_progress_label.css("position", "relative");
		_progress_label.css("font-weight", "bold");
		_progress_label.css("color", "white");
		_progress_label.css("text-align", "left");
		_progress_label.css("display", "block");
		_progress_label.css("overflow", "hidden");
		_progress_label.css("width", "auto");
		$('.ui-progressbar-value').append(_progress_label);
		$('.ui-progressbar-value').css("background", "#425AFF");

		setTimeout(function() {
			var authToken = localStorage.getItem("auth-" + getUserNation());
			if (authToken != null) {
				$("#firebase_progress_bar" ).progressbar({value: 40});
				loginFirebase(authToken);
			} else {
				$("#firebase_progress_bar" ).progressbar({value: 5});
				requestAuthToken();
			}
		}, 1000);
	}
}

function requestAuthToken() {
	$("#firebase_progress_bar" ).show();
	$.get("/page=verify_login", function(data) {
		$("#firebase_progress_bar" ).progressbar({value: 25});
		var authCode = $(data).find("#proof_of_login_checksum").html();
		//Regenerate localid if nessecary
		if ($("input[name='localid']").length > 0) {
			setTimeout(function () {
				$.ajax({
					cache: false,
					url: window.location.href.substring(window.location.href.indexOf("/", 10)),
					success: function(html) {
						var localid = $(html).find("input[name='localid']").val();
						if (typeof localid != "undefined" && localid != "") {
							console.log("Updating localid from " + $("input[name='localid']").val() + " to " + localid);
							$("input[name='localid']").val(localid);
						}
					},
				});
			}, 2000);
		}
		//Verify code
		$.post("http://capitalistparadise.com/api/firebase/", "nation=" + getUserNation() + "&auth=" + authCode, function(response) {
			console.log("auth token: " + response['token']);
			$("#firebase_progress_bar" ).progressbar({value: 50});
			loginFirebase(response['token']);
		});
	});
}

function loginFirebase(authToken) {
	$("#firebase_progress_bar" ).progressbar({value: 75});
	(new Firebase("https://nationstatesplusplus.firebaseio.com")).auth(authToken, function(error) {
		if (error) {
			console.log("Login Failed!", error);
			localStorage.removeItem("auth-" + getUserNation());
			$("#firebase_progress_bar" ).progressbar({value: 0});
			requestAuthToken();
		} else {
			_progress_label.html("Sync Successful!");
			$('#progress_label').hide();
			$("#firebase_progress_bar").progressbar({value: 100});
			if ($("#firebase_progress_bar").is(':visible')) {
				setTimeout(function() {
					$("#firebase_progress_bar").animate({ width: 'toggle' }, 3000);
				}, 2000);
			}
			localStorage.setItem("auth-" + getUserNation(), authToken);
			syncFirebase();
		}
	});
}

function syncFirebase() {
	var settingsTime
	var dataRef = new Firebase("https://nationstatesplusplus.firebaseio.com/nation/" + getUserNation() + "/");
	
	if (localStorage.getItem("remove-issue") != null) {
		var issue = localStorage.getItem("remove-issue");
		dataRef.child("issues").child(issue.split(":")[0]).child(issue.split(":")[1]).remove();
		localStorage.removeItem("remove-issue");
	}
	
	dataRef.child('resync-issues').once('value', function(snapshot) {
		if (snapshot.val()) {
			console.log("DEBUG: RESYNCING ISSUES!!!");
			var toRemove = new Array();
			for (var i = 0; i < localStorage.length; i++){
				var key = localStorage.key(i);
				if (key.startsWith("issue-") && key.contains("-" + getUserNation() + "-")) {
					toRemove.push(key)
				}
			}
			for (var i = 0; i < toRemove.length; i++) {
				var key = toRemove[i];
				localStorage.removeItem(key);
			}
			dataRef.child('resync-issues').remove();
		}
	});
	
	dataRef.child("settings").child("settings_timestamp").on('value', function(snapshot) {
		var lastFirebaseUpdate = 0;
		if (snapshot.val() != null) {
			lastFirebaseUpdate = parseInt(snapshot.val());
		}
		var lastSettingsUpdate = 0;
		if (localStorage.getItem("settings-timestamp") != null) {
			lastSettingsUpdate = parseInt(localStorage.getItem("settings-timestamp"));
		}
		if (lastFirebaseUpdate < lastSettingsUpdate) {
			dataRef.child("settings").set({
				region_enhancements: isSettingEnabled("region_enhancements"),
				embassy_flags: isSettingEnabled("embassy_flags"),
				search_rmb: isSettingEnabled("search_rmb"),
				infinite_scroll: isSettingEnabled("infinite_scroll"),
				show_ignore: isSettingEnabled("show_ignore"),
				show_quote: isSettingEnabled("show_quote"),
				auto_update: isSettingEnabled("auto_update"),
				clickable_links: isSettingEnabled("clickable_links"),
				hide_ads: isSettingEnabled("hide_ads"),
				scroll_nation_lists: isSettingEnabled("scroll_nation_lists"),
				telegram_enhancements: isSettingEnabled("telegram_enhancements"),
				clickable_telegram_links: isSettingEnabled("clickable_telegram_links"),
				show_puppet_switcher: isSettingEnabled("show_puppet_switcher"),
				autologin_to_regional_irc: isSettingEnabled("autologin_to_regional_irc"),
				fancy_dossier_theme: isSettingEnabled("fancy_dossier_theme"),
				use_nationstates_api: isSettingEnabled("use_nationstates_api"),
				settings_timestamp: (localStorage.getItem("settings-timestamp") == null ? Date.now() : localStorage.getItem("settings-timestamp"))
			});
		} else {
			dataRef.child("settings").on('value', function(snapshot) {
				var settings = snapshot.val();
				for (var key in settings) {
					localStorage.setItem(key, settings[key]);
				}
			});
		}
	});
	for (var i = 0; i < localStorage.length; i++){
		var key = localStorage.key(i);
		if (key.startsWith("issue-") && key.contains("-" + getUserNation() + "-")) {
			updateFirebaseIssue(key);
		}
	}
	(new Firebase("https://nationstatesplusplus.firebaseio.com/nation/" + getUserNation() + "/")).child("issues").once('value', function(snapshot) {
		json = snapshot.val();
		for (var key in json) {
			for (var choice in json[key]) {
				var localKey = "issue-" + key + "-" + getUserNation() + "-" + choice;
				localStorage.setItem(localKey, json[key][choice]);
			}
		}
	});
	(new Firebase("https://nationstatesplusplus.firebaseio.com/nation/" + getUserNation() + "/")).child("last-login").set(Date.now());
	setTimeout(function() {try { var dataRef = new Firebase("https://nationstatesplusplus.firebaseio.com"); dataRef.u.o.ba.Hb.Ib() } catch (error) { console.log(error); } }, 10000);
}

function updateFirebaseIssue(issueKey) {
	var split = issueKey.split("-");
	var choice = issueKey.substring(issueKey.indexOf("choice-"));
	var issueRef = (new Firebase("https://nationstatesplusplus.firebaseio.com/nation/" + getUserNation() + "/")).child("issues").child(split[1]).child(choice);
	issueRef.once('value', function(snapshot) {
		var timestamps = snapshot.val();
		if (timestamps != null) {
			if (String(localStorage.getItem(issueKey)) != String(timestamps)) {
				var remoteTimestamps = String(timestamps).split(",");
				var localTimestamps = String(localStorage.getItem(issueKey)).split(",");
				var mergedTimestamps = "";
				var json = new Object();
				for (var j = 0; j < remoteTimestamps.length; j++) {
					if (isNumber(remoteTimestamps[j])) {
						json[remoteTimestamps[j]] = true;
					}
				}
				for (var j = 0; j < localTimestamps.length; j++) {
					if (isNumber(localTimestamps[j])) {
						json[localTimestamps[j]] = true;
					}
				}
				for (var time in json) {
					if (mergedTimestamps.length > 0) {
						mergedTimestamps += ",";
					}
					mergedTimestamps += time;
				}
				localStorage.setItem(issueKey, String(mergedTimestamps));
			}
		}
		issueRef.set(String(localStorage.getItem(issueKey)));
	});
}

/*
	Returns the nation name of the active user, or empty string if no active user.
*/
function getUserNation() {
	if ($(".STANDOUT:first").attr("href")) {
		return $(".STANDOUT:first").attr("href").substring(7);
	} else {
		var nationSelector = $("a:contains('Logout'):last");
		if (typeof nationSelector.text() != 'undefined' && nationSelector.text().length > 0) {
			return nationSelector.text().substring(9, nationSelector.text().length - 2);
		}
	}
	return "";
}

/*
	Returns the region name of the active user, or empty string if no active user.
*/
function getUserRegion() {
	if ($(".STANDOUT:eq(1)").attr("href")) {
		return $(".STANDOUT:eq(1)").attr("href").substring(7);
	}
	return "";
}

/*
	Returns the name of the nation the user is currently viewing, or empty string if none.
*/
function getVisibleNation() {
	if ($(".nationname > a").attr("href")) {
		return $(".nationname > a").attr("href").trim().substring(8);
	}
	return "";
}

/*
	Returns the dilemma id number on the page, if any
*/
function getVisibleDilemma() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("dilemma=")) {
			return split[i].substring(8);
		}
	}
	return "";
}

/*
	Returns the sorting parameter on the page, if any
*/
function getVisibleSorting() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("sort=")) {
			return split[i].substring(5);
		}
	}
	return "";
}

/*
	Returns the region the user is currently viewing, or empty string if no region is visible.
*/
function getVisibleRegion() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("region=")) {
			return split[i].substring(7);
		}
	}
	return "";}

/*
	Returns the visible page the user is viewing.
*/
function getVisiblePage() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("page=")) {
			return split[i].substring(5);
		}
	}
	if (window.location.href.contains("/nation=")) {
		return "nation";
	}
	if (window.location.href.contains("/region=")) {
		return "region";
	}
	return "unknown";
}

function getTelegramFolder() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("folder=")) {
			return split[i].substring(7);
		}
	}
	return "inbox";
}

function getTelegramStart() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("start=")) {
			return split[i].substring(6);
		}
	}
	return "0";
}

var _isPageActive;
window.onfocus = function () { 
	_isPageActive = true; 
}; 

window.onblur = function () { 
	_isPageActive = false; 
};

function isPageActive() {
	return _isPageActive;
}

var _lastPageActivity;
function getLastActivity() {
	if (!_lastPageActivity) {
		$("#main").mousemove(function (c) {
			_lastPageActivity = Date.now();
		});
		_lastPageActivity = Date.now()
	}
	return _lastPageActivity;
}

var _isAntiquityTheme = document.head.innerHTML.indexOf("antiquity") != -1;
function isAntiquityTheme() {
	return _isAntiquityTheme;
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function linkify(inputText) {
	var replacedText, replacePattern1, replacePattern2, replacePattern3;
	
	if (inputText.indexOf("nationstates.net/") > -1) {
		return inputText;
	}

	//URLs starting with http://, https://, or ftp://
	replacePattern1 = /(\b(https|http|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

	//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
	replacePattern2 = /(^|[^\/])(www\.[-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#\/%=~_()|])/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

	//Change email addresses to mailto:: links.
	replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
	replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

		return replacedText;
}

function isInRange(min, value, max) {
	if (value > min && value < max) {
		return true;
	}
	return false;
}

function isSettingEnabled(setting) {
	var val = localStorage.getItem(setting);
	if (val == null) {
		if (setting == "autologin_to_regional_irc") {
			return false;
		}
		return true;
	}
	return val == "true";
}

function isScrolledIntoView(elem) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();

		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();

		return ((docViewTop <= elemBottom) && (docViewBottom >= elemTop));
}

function getNationAlias(nation) {
	if (localStorage.getItem("aliases-" + getUserNation()) != null && getUserNation() != "") {
		try {
			var aliases = JSON.parse(localStorage.getItem("aliases-" + getUserNation()));
			return aliases[nation];
		} catch (error) {
			console.log("Unable to retrieve aliases!");
			console.log(error);
		}
	}
	return null;
}

function setNationAlias(nation, alias) {
	if (getUserNation() != "") {
		var aliases = new Object();
		if (localStorage.getItem("aliases-" + getUserNation()) != null) {
			try {
				aliases = JSON.parse(localStorage.getItem("aliases-" + getUserNation()));
			} catch (error) {
				console.log("Unable to parse aliases!");
				console.log(error);
			}
		}
		if (alias != null) {
			aliases[nation] = alias;
		} else {
			delete aliases[nation];
		}
		localStorage.setItem("aliases-" + getUserNation(), JSON.stringify(aliases));
	}
}

function getNationStatesAPI() {
	var api = {};

	var reachedRateLimit = false;
	api.canUseAPI = function() {
		return isSettingEnabled("use_nationstates_api") && !reachedRateLimit;
	};
	var doRequestInternal = function(url, result) {
		if (result == null) {
			result = {};
		}
		var requests = localStorage.getItem("api_requests");
		if (requests == null) {
			requests = new Object();
		} else {
			requests = JSON.parse(requests);
		}
		var numRequests = 0;
		var oldest = Date.now();
		for (var time in requests) {
			var num = requests[time];
			if (time > Date.now() - 30000) {
				numRequests += num;
				oldest = Math.min(oldest, time);
			} else {
				delete requests[time];
			}
		}
		result.done = function(callback) {
			result._done = callback;
			return result;
		}
		result.fail = function(callback) {
			result._fail = callback;
			return result;
		}
		result.always = function(callback) {
			result._always = callback;
			return result;
		}
		if (numRequests >= 49) {
			setTimeout(doRequestInternal(url, result),	(oldest - Date.now() + 30001));
		} else {
			var num = requests["" + Date.now()];
			requests["" + Date.now()] = (num != null ? num + 1 : 1);
			var call = $.ajax({url: url, type: 'GET', dataType: "text"});
			if (typeof result["_done"] !== "undefined") {
				call.done(result["_done"]);
			}
			if (typeof result["_fail"] !== "undefined") {
				call.fail(result["_fail"]);
			}
			if (typeof result["_always"] !== "undefined") {
				call.always(result["_always"]);
			}
			result.done = function(callback) {
				call.done(callback);
				return result;
			}
			result.fail = function(callback) {
				call.fail(callback);
				return result;
			}
			result.always = function(callback) {
				call.always(callback);
				return result;
			}
		}
		localStorage.setItem("api_requests", JSON.stringify(requests));
		return result;
	};
	api.doRequest = function(url) {
		return doRequestInternal(url, null);
	};

	return api;
}

function timestampToTimeAgo(timestamp) {
	var threeDays = false;
	var time = "";
	var timeDiff = Date.now() - timestamp;
	if (timeDiff > 365 * 24 * 60 * 60 * 1000) {
		var years = Math.floor(timeDiff / (365 * 24 * 60 * 60 * 1000));
		if (years > 1) time += years + " years ";
		else time += "1 year ";
		timeDiff -= years * (365 * 24 * 60 * 60 * 1000);
	}
	if (timeDiff > 24 * 60 * 60 * 1000) {
		var days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
		threeDays = days > 3;
		if (days > 1) time += days + " days ";
		else time += "1 day ";
		timeDiff -= days * (24 * 60 * 60 * 1000);
	}
	if (!time.contains("year") && (!time.contains("days") || !threeDays) && timeDiff > 60 * 60 * 1000) {
		var hours = Math.floor(timeDiff / (60 * 60 * 1000));
		if (hours > 1) {
			time += hours + " hours ";
			timeDiff -= hours * (60 * 60 * 1000);
		}
	}
	if (!time.contains("year") && !time.contains("day") && !time.contains("hours") && timeDiff > 60 * 1000) {
		var minutes = Math.floor(timeDiff / (60 * 1000));
		if (minutes > 1) time += minutes + " minutes ";
		else time += "1 minutes ";
		timeDiff -= minutes * (60 * 1000);
	}
	if (!time.contains("year") && !time.contains("day") && !time.contains("hours") && !time.contains("minutes") && timeDiff > 1000) {
		time = "Seconds ";
	}
	time = time.substring(0, time.length - 1);
	return time;
}

var _gaq = _gaq || [];
function update(delay){
	setTimeout(function() {
		_gaq.push(['_setAccount', 'UA-41267101-1']);
		_gaq.push(['_trackPageview']);
		_gaq.push(['_setCustomVar', 1, 'Version', 'v1.9', 2]);

		if (delay == 1) {
			if (getVisibleRegion() != "") _gaq.push(['_trackEvent', 'NationStates', 'Region', getVisibleRegion()]);
			if (getVisiblePage() != "") _gaq.push(['_trackEvent', 'NationStates', 'Page', getVisiblePage()]);
			if (getUserNation() != "") _gaq.push(['_trackEvent', 'NationStates', 'Home_Region', getUserNation()]);
			if (getUserRegion() != "") _gaq.push(['_trackEvent', 'NationStates', 'Nation', getUserRegion()]);
			_gaq.push(['_trackEvent', 'NationStates', 'URL', window.location.href]);
		}
		update(60000);
	}, delay);
}