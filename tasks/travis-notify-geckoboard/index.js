#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var questor = require('questor');

var pushBaseURI = 'https://push.geckoboard.com/v1/send/';

exports.notifyDashboard = notifyDashboard;
function notifyDashboard(options, data) {
	var payload = {
		api_key: options.apiKey,
		data: data
	};
	return questor(pushBaseURI + options.widgetKey, {
		method: 'POST',
		body: JSON.stringify(payload)
	}).then(function(response) {
		if (response.status !== 200) {
			throw new Error(response.body);
		}
	});
}

exports.TextWidgetValue = TextWidgetValue;
function TextWidgetValue() {}
TextWidgetValue.create = function(properties) {
	return _.extend(new TextWidgetValue(), {item: [properties]});
};

exports.TravisCIEnv = TravisCIEnv;
function TravisCIEnv() {}
TravisCIEnv.createFromEnv = function(env) {
	return _.extend(new TravisCIEnv(), {
		branch: env.TRAVIS_BRANCH,
		buildNumber: env.TRAVIS_BUILD_NUMBER,

		pr: env.TRAVIS_PULL_REQUEST,
		prBranch: env.TRAVIS_PULL_REQUEST_BRANCH,

		repoSlug: env.TRAVIS_REPO_SLUG,
		testResult: env.TRAVIS_TEST_RESULT
	});
};
TravisCIEnv.prototype.toTextWidgetValue = function(building) {
	const getBuildTitle = () =>
		(
			((this.pr && this.pr !== 'false') ?
				'PR #' + this.pr + '<br/> ' + this.prBranch :
				this.branch)
		);

	var color, text, type;
	if (building) {
		color = '#eca245';
		text = 'Building&hellip;';
		type = 0;
	} else {
		var passed = (this.testResult === '0');
		color = passed ? '#90c564' : '#e3524f';
		text = passed ? 'Passed' : 'Failed';
		type = passed ? 0 : 1;
	}

	return TextWidgetValue.create({
		text: [
			'<div>' + getBuildTitle() + '</div>',
			'<div style="color: ' + color + '">' + text + '</div>'
		].join('\n'),
		type: type
	});
};
