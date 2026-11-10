const block_until_accepted = dataObject.block_until_accepted;
const allowed_cookies = dataObject.allowed_cookies;
const days_to_expire = 30;
const expire_time = days_to_expire * 24 * 60 * 60;
const cookie_path = '/';
const plugin_cookies = dataObject.plugin_cookies;
const accept_after_time = dataObject.accept_after_time;
const accept_on_scroll = dataObject.accept_on_scroll;
const time_to_accept = dataObject.accept_after;
const patterns = dataObject.necessary_patterns;

jQuery(window).scroll(function () {
    if (accept_on_scroll  && flexibleCookiesFunctions.getCookieValue(plugin_cookies['bar']) === false) {
        flexibleCookiesBlocker.acceptAllCookies();
    }
});

jQuery(function () {
    if (accept_after_time && flexibleCookiesFunctions.getCookieValue(plugin_cookies['bar']) === false) {
        setTimeout(flexibleCookiesBlocker.acceptAllCookies, time_to_accept * 1000);
    }
})

class FlexibleCookiesBlocker {

    blockCookies() {
        let cookies_array = flexibleCookiesFunctions.getCookiesArray();
        cookies_array.forEach(function (cookie) {
            if (!Object.values(allowed_cookies).includes(cookie.name) && !flexibleCookiesBlocker.containsNecessaryPattern(cookie.name)) {
                flexibleCookiesBlocker.blockCookie(cookie.name);
            }
        });
    }

    blockCookie(cookie_name) {
        flexibleCookiesFunctions.setCookie(cookie_name, '', {'expires':'Thu, 01 Jan 1970 00:00:00 UTC', 'path':'/', 'domain':'' });
    }

    acceptAllCookies() {
        let categories = flexibleCookiesFunctions.getAllCategories();
        flexibleCookiesUI.hideCookieBar();
		flexibleCookiesUI.checkAllCategoryCheckboxes();
        flexibleCookiesBlocker.savePreferences(categories.join(','));
        flexibleCookiesFunctions.setCookie(plugin_cookies['accepted_all_cookies'], expire_time, {'max-age':expire_time, 'path':cookie_path });
		if( typeof flexibleCookiesGTMConsentUpdater !== 'undefined' && flexibleCookiesGTMConsentUpdater !== null ){
			flexibleCookiesGTMConsentUpdater.grantAll();
		}
    }

    denyAllCookies() {
        flexibleCookiesUI.hideCookieBar();
        flexibleCookiesBlocker.savePreferences();
		flexibleCookiesUI.uncheckAllCategoryCheckboxes();
		if( typeof flexibleCookiesGTMConsentUpdater !== 'undefined' && flexibleCookiesGTMConsentUpdater !== null ){
			let allowed_categories = flexibleCookiesFunctions.getAcceptedCategories();
			flexibleCookiesGTMConsentUpdater.grantAcceptedCategories( allowed_categories );
		}
    }

    acceptSelectedCookies() {
		let allowed_categories = flexibleCookiesFunctions.getAcceptedCategories();
        flexibleCookiesBlocker.savePreferences(allowed_categories.join(','));
        flexibleCookiesBlocker.blockCookie(plugin_cookies['accepted_all_cookies']);
        flexibleCookiesUI.hideCookiesSettingsWindow();
        flexibleCookiesUI.hideCookieBar();
		if( typeof flexibleCookiesGTMConsentUpdater !== 'undefined' && flexibleCookiesGTMConsentUpdater !== null ){
			flexibleCookiesGTMConsentUpdater.grantAcceptedCategories( allowed_categories );
		}
    }

    savePreferences(categories = '') {
        flexibleCookiesFunctions.setCookie(plugin_cookies['bar'], expire_time, {'max-age':expire_time, 'path':cookie_path });
        flexibleCookiesFunctions.setCookie(plugin_cookies['accepted_categories'], categories, {'max-age':expire_time, 'path':cookie_path });
    }

    containsNecessaryPattern(cookie_name) {
        for (let i = 0; i < patterns.length; i++) {

            if (cookie_name.includes(patterns[i])) {
                return true;
            }
        }

        return false;
    }
}

jQuery(function () {
    if (flexibleCookiesFunctions.getCookieValue(plugin_cookies['bar']) === false && block_until_accepted) {
        flexibleCookiesBlocker.blockCookies();
    }
    else if (flexibleCookiesFunctions.getCookieValue(plugin_cookies['bar']) !== false && flexibleCookiesFunctions.getCookieValue(plugin_cookies['accepted_all_cookies']) === false) {
        flexibleCookiesBlocker.blockCookies();
    }

});
const flexibleCookiesBlocker = new FlexibleCookiesBlocker();
