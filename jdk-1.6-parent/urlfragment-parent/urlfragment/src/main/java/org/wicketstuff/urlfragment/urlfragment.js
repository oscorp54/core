function newUrlUtil(options) {

	var defaults = {
	      fragmentIdentifierSuffix: '!',
		    keyValueDelimiter: '=',
      },
	    options = $.extend(defaults, options),
	    hashIdentifier = '#' + options.fragmentIdentifierSuffix,
	    queryPrefix = '?',
		  parameterPattern = new RegExp('([^&' + options.keyValueDelimiter + ']+)' + options.keyValueDelimiter + '?([^&]*)(?:&+|$)', 'g'),
	    wicketAjaxCall = undefined;

	function getQueryParameters() {
		return getParameters(window.location.search, queryPrefix);
	}

	function getFragmentParameters() {
		return getParameters(window.location.hash, hashIdentifier);
	}

	function getParameters(urlPart, prefix) {
		var urlPartWithoutPrefix = (urlPart || prefix).substr(prefix.length), parameterMap = {};
		urlPartWithoutPrefix.replace(parameterPattern, function(match, key, value) {
			parameterMap[key] = value;
		});
		return parameterMap;
	}

	return {
		setFragmentParameter : function(name, value) {
			var fragmentParameters = getFragmentParameters(),
			    hash = hashIdentifier;
			
			fragmentParameters[name] = value;
			for (parameter in fragmentParameters) {
				var hashBegin = hash === hashIdentifier ? '' : '&';
				hash = hash.concat(hashBegin).concat(parameter).concat(options.keyValueDelimiter)
						.concat(fragmentParameters[parameter]);
			}
			
			this.editedFragment = true;
			window.location.hash = hash;
		},
		addFragmentParameter : function(name, value, keyValueDelimiteriter) {
			var fragmentParameters = getFragmentParameters(),
			hash = hashIdentifier;
			
			if(fragmentParameters[name]) {
				fragmentParameters[name] = fragmentParameters[name].concat(keyValueDelimiteriter).concat(value);			
			} else {
				fragmentParameters[name] = value;
			}
			
			for (parameter in fragmentParameters) {
				var hashBegin = hash === hashIdentifier ? '' : '&';
				hash = hash.concat(hashBegin).concat(parameter).concat(options.keyValueDelimiter)
						.concat(fragmentParameters[parameter]);
			}
			
			this.editedFragment = true;
			window.location.hash = hash;
		},
		removeFragmentParameter : function(name) {
			var fragmentParameters = getFragmentParameters(),
			    hash = hashIdentifier;
			
			for (parameter in fragmentParameters) {
				var hashBegin = hash === hashIdentifier ? '' : '&';
				if (parameter != name) {
					hash = hash.concat(hashBegin).concat(parameter).concat(options.keyValueDelimiter)
							.concat(fragmentParameters[parameter]);
				}
			}
			
			this.editedFragment = true;
			window.location.hash = hash === hashIdentifier ? '' : hash;
		},
		joinQueryAndFragment : function() {
			var queryParameters = getFragmentParameters(),
			    fragmentParameters = getQueryParameters();
			
			for (parameter in fragmentParameters) {
				queryParameters[parameter] = fragmentParameters[parameter];
			}
			return queryParameters;
		},
		sendUrlParameters : function() {
			if (!this.sentParametersOnInitialPageLoad) {
				wicketAjaxCall();
				this.sentParametersOnInitialPageLoad = true;
			}
		},
		back : function() {
			if (UrlUtil.editedFragment) { // hashchange through set/add/removeFragmentParameter
				UrlUtil.editedFragment = false;
			} else { // hashchange through back button
				wicketAjaxCall();
			}
		},
		setWicketAjaxCall : function(ajaxCallFunction) {
			wicketAjaxCall = ajaxCallFunction;
		},
		sentParametersOnInitialPageLoad : false, // used to avoid executing the Wicket AJAX call infinitely
		editedFragment : false
	};
};

if (typeof exports != 'undefined') {
	exports.UrlUtil = newUrlUtil;
}