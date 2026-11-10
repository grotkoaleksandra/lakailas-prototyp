jQuery(function ($) {
    $('#flexiblecookies_accept_cookies').on('click', flexibleCookiesBlocker.acceptAllCookies);
    $('#flexiblecookies_deny_cookies').on('click', flexibleCookiesBlocker.denyAllCookies);
    $('.flexiblecookies_open_settings_button').on('click', flexibleCookiesUI.showCookiesSettingsWindow);
    $('#flexiblecookies_accept_settings_cookies').on('click', flexibleCookiesBlocker.acceptSelectedCookies);
    $('#flexiblecookies_close_settings').on('click', flexibleCookiesUI.hideCookiesSettingsWindow);
    $('#flexiblecookies_settings_background').on('click', flexibleCookiesUI.hideCookiesSettingsWindow);

    if (flexibleCookiesFunctions.getCookieValue(plugin_cookies['bar']) === false) {
        flexibleCookiesUI.showCookieBar();
    }
    if(flexibleCookiesFunctions.getCookieValue(plugin_cookies['bar']) !== false) {
        flexibleCookiesUI.showReopenSettingsButton();
    }
});

class FlexibleCookiesFunctions{
    getCookieValue( cookie_name ){
        let name = cookie_name + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return false;
    }
    getCookiesArray(){
        let cookiesArray = [];
        let cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            let cookieParts = cookie.split("=");
            let cookieName = cookieParts[0];
            let cookieValue = cookieParts[1];

            cookiesArray.push({
                name: cookieName,
                value: cookieValue
            });
        }

        return cookiesArray;
    }
    setCookie( cookie_name , cookie_value , parameters) {
		let newCookie = cookie_name + '=' + cookie_value + ';'

		Object.entries(parameters).forEach(function([key, value]) {
			newCookie += key + '=' + value + ';';
		});
		document.cookie = newCookie;
    }
    getAcceptedCategories(){
        const checkboxValues = [];

        jQuery('.wpdesk-cookie-category:checked').each(function() {
            checkboxValues.push(jQuery(this).val());
        });

        return checkboxValues;
    }
    getAllCategories(){
        const checkboxValues = [];

        jQuery('.wpdesk-cookie-category').each(function() {
            checkboxValues.push(jQuery(this).val());
        });

        return checkboxValues;

    }
}
const flexibleCookiesFunctions = new FlexibleCookiesFunctions();
