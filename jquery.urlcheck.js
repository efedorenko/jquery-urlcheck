var URLCheck = {

	warningTooLong: 'The URL must be no more than %maxlength% characters. We converted it to:',
	warningHttp:    'You only need to include the editable part of the URL:',
	warningInvalid: 'Use only lowercase letters, numbers and dashes. We converted it to:',

	init: function (input) {
		input.each(function () {
			URLCheck.setSyncInput($(this));
			URLCheck.resetMaxLength($(this));
			URLCheck.prefillWithValue($(this));
		});

		input.keyup(function () {
			var self     = $(this),
			    sync     = $(this).parent().find('input[type="hidden"]'),
				el       = $(self).parents('.form-url'),
				url      = $(self).val(),
				validUrl = URLCheck.convert(self);


			function clearState() {
				self.removeClass('field-ok field-error');
				el.removeClass('form-error');

				if (el.find('p.error-msg').length) {
					el.find('p.error-msg').remove();
				}

				el.find('.url-preview').off('click.correctInput');
			}

			function showWarning(warningCopy) {
				warningCopy = warningCopy.replace(/%maxlength%/, URLCheck.getMaxLength(self));

				if (!el.find('p.error-msg').length) {
					$('<p></p>').addClass('error-msg').prependTo(el.find('.form-text'));
				}

				el.find('p.error-msg').html(warningCopy);
			}


			if (url.length > 0) {

				// Check input

				if (url === validUrl) {
					clearState();
					self.addClass('field-ok');
				} else {
					el.addClass('form-error');
					self.removeClass('field-ok').addClass('field-error');

					if (url.length > URLCheck.getMaxLength(self)) {
						showWarning(URLCheck.warningTooLong);
					} else if (url.substr(0, 5) === 'http:' || url.substr(0, 6) === 'https:') {
						showWarning(URLCheck.warningHttp);
					} else {
						showWarning(URLCheck.warningInvalid);
					}

					el.find('.url-preview').on('click.correctInput', function () {
						self.val(validUrl);
						input.keyup();
					});
				}

			} else {

				// Input is empty

				clearState();
				validUrl = null;
			}

			// Update hidden URL and preview

			sync.val(validUrl);
			el.find('.url-input').html(validUrl);

		});

	},

	setSyncInput: function (input) {
		$(document.createElement('input'))
			.attr({
				type: 'hidden',
				name: input.attr('name')
			})
			.val(
				URLCheck.convert(input)
			)
			.prependTo(
				input.removeAttr('name').parent()
			);
	},

	resetMaxLength: function (input) {
		if (input.data('maxlength') === undefined && input.attr('maxlength') !== undefined) {
			input.data('maxlength', input.attr('maxlength')).removeAttr('maxlength');
		}
	},

	getMaxLength: function (input) {
		URLCheck.resetMaxLength(input);
		return input.data('maxlength') === -1 ? 524288 : input.data('maxlength');
	},

	prefillWithValue: function (input) {
		if (input.val() !== '') {
			input.parents('.form-url').find('.url-input').html(URLCheck.convert(input));
		}
	},

	convert: function (input) {
		var validUrl = input.val(),
		    allowUnderscore     = input.data('allowUnderscore') ? true : false,
		    allowMultipleDashes = input.data('allowMultipleDashes') ? true : false;

		validUrl = validUrl
			.replace(/^\s*/g, '')							// Remove spaces from the beginning
			.replace(/[^\w]/g, '-')							// Replace everything except of letters, digits, and underscores with dash
			.toLowerCase()									// Convert to the lowercase
			.substr(0, URLCheck.getMaxLength(input));		// Cut to the maxlength

		if (!allowUnderscore) {
			validUrl = validUrl.replace(/_/g, '-');			// Replace underscores with dash
		}

		if (!allowMultipleDashes) {
			validUrl = validUrl.replace(/\-{2,}/g, '-');	// Replaces several dashes with one
		}

		if (validUrl.match(/^-/g)) {
			validUrl = validUrl.replace(/^-/g, '');			// Remove hyphen at the beginning
		}

		if (validUrl.match(/-$/g)) {
			validUrl = validUrl.replace(/-$/g, '');			// Remove hyphen at the end
		}

		return validUrl;
	}
};

$.fn.URLCheck = function (method) {

	if (!$(this).length) { return; }

	if (URLCheck[method]) {
		return URLCheck[method](this);
	} else if (typeof method === 'object' || !method) {
		URLCheck.init(this);
		return this;
	} else {
		console.log('Method ' +  method + ' does not exist on jQuery.URLCheck');
		return this;
	}
};