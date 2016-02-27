"""
.. module:: api
	:platform: Unix
	:synopsis: Flask endpoints for the API

.. moduleauthor:: Tim Poon <timothycpoon@gmail.com>

"""

import simplejson as json
from flask import Flask, request

from utils import crossdomain, send_email

app = Flask(__name__)

@app.route('/contact/', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def contact():
	""" Process contact requests

	"""
	if 'email' not in request.form or 'body' not in request.form:
		return json.dumps({'error': 'Missing parameters'})

	try:
		send_email(
			from_addr=request.form['email'],
			message_body=request.form['body'])
		return json.dumps({'sent': True})

	except Exception as error:
		print('ERROR', error, dir(error), error.args)
		return json.dumps({'error': str(error)})

if __name__ == '__main__':
	app.run()
