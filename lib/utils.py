"""
.. module:: utils
	:platform: Unix
	:synopsis: Utilities for the API

.. moduleauthor:: Tim Poon <timothycpoon@gmail.com>

"""

import html
import datetime
from urllib import parse

import requests
import simplejson as json
from pyisemail import is_email
from flask import Flask, make_response, request, current_app
from functools import update_wrapper

MAILGUN_URL = 'https://api.mailgun.net/v3/mg.elite-dodgeball.com'
MAILGUN_KEY = 'key-dummykey'
DEFAULT_CONTACT_EMAIL = 'Adrenaline Rush <contact@arushdball.com>'

def crossdomain(origin=None, methods=None, headers=None,
				max_age=21600, attach_to_all=True,
				automatic_options=True):
	""" CORS decorator for XHR

	"""
	if methods is not None:
		methods = ', '.join(sorted(x.upper() for x in methods))
	if headers is not None and not isinstance(headers, str):
		headers = ', '.join(x.upper() for x in headers)
	if not isinstance(origin, str):
		origin = ', '.join(origin)
	if isinstance(max_age, datetime.timedelta):
		max_age = max_age.total_seconds()

	def get_methods():
		if methods is not None:
			return methods

		options_resp = current_app.make_default_options_response()
		return options_resp.headers['allow']

	def decorator(f):
		def wrapped_function(*args, **kwargs):
			if automatic_options and request.method == 'OPTIONS':
				resp = current_app.make_default_options_response()
			else:
				resp = make_response(f(*args, **kwargs))
			if not attach_to_all and request.method != 'OPTIONS':
				return resp

			h = resp.headers
			h['Access-Control-Allow-Origin'] = origin
			h['Access-Control-Allow-Methods'] = get_methods()
			h['Access-Control-Max-Age'] = str(max_age)
			h['Access-Control-Allow-Credentials'] = 'true'
			h['Access-Control-Allow-Headers'] = \
				"Origin, X-Requested-With, Content-Type, Accept, Authorization"
			if headers is not None:
				h['Access-Control-Allow-Headers'] = headers
			return resp

		f.provide_automatic_options = False
		return update_wrapper(wrapped_function, f)
	return decorator

def send_email(to_addr=None, from_addr=None, message_body=None):
	""" Send the contact information to an email address

	:param to_addr: The email address to send to
	:type to_addr: str
	:param from_addr: The email address to send from
	:type from_addr: str
	:param message_body: Body of the email to send
	:type message_body: str
	:returns: requests.Response

	"""
	if to_addr:
		if not isinstance(to_addr, str):
			raise TypeError('to_addr must be a string')
		if not is_email(to_addr):
			raise ValueError('to_addr must be a valid email address')
	else:
		to_addr = DEFAULT_CONTACT_EMAIL

	if not isinstance(from_addr, str):
		raise TypeError('from_addr must be a string')
	if not is_email(from_addr):
		raise ValueError('from_addr must be a valid email address')

	if not isinstance(message_body, str) or not message_body:
		raise TypeError('message_body must be a string')

	fdate = datetime.datetime.now().strftime('%B %d, %Y at %I:%M:%S %p')

	return requests.post(
		url='%s/messages' % MAILGUN_URL,
		auth=('api', '%s' % MAILGUN_KEY),
		data={
			'to': to_addr,
			'from': 'Contact Form <%s>' % from_addr,
			'subject': 'Adrenaline Rush Contact Form - %s' % fdate,
			'text': '%s\r\n\r\n%s said:\r\n\r\n%s' % (
				fdate, from_addr, message_body),
			'html': '%s<br /><br />%s (<a href="mailto:%s?%s">%s</a>) said:<br /><br />%s' % (
				fdate, from_addr, from_addr, parse.urlencode(query={
					'subject': 'RE: Adrenaline Rush Contact Form - %s' % fdate
				}), from_addr, html.escape(s=message_body).replace('\n', '<br />')),
		})
