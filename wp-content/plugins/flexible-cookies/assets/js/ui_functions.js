class FlexibleCookiesUI {
    showCookieBar() {
        jQuery('#flexiblecookies_container').fadeIn(500);
    }
    hideCookieBar() {
        jQuery('#flexiblecookies_cookie_banner').fadeOut(1500);
        flexibleCookiesUI.showReopenSettingsButton();
    }
    showCookiesSettingsWindow() {
        jQuery('#flexiblecookies_settings_background').fadeIn(500);
        jQuery('#flexiblecookies_settings_container').fadeIn(700);
    }
    hideCookiesSettingsWindow() {
        jQuery('#flexiblecookies_settings_background').fadeOut(300);
        jQuery('#flexiblecookies_settings_container').fadeOut(300);
    }
    showReopenSettingsButton(){
        jQuery('.flexible-cookies-reopen-settings').fadeIn(500);
    }

	checkAllCategoryCheckboxes() {
		jQuery('.wpdesk-cookie-category').prop('checked', true);
	}
	uncheckAllCategoryCheckboxes() {
		jQuery('.wpdesk-cookie-category').prop('checked', false);
	}
}

const flexibleCookiesUI = new FlexibleCookiesUI();

