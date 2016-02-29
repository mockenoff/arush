"""
.. module:: social_feed
	:platform: Unix
	:synopsis: Generate feeds for social media

.. moduleauthor:: Tim Poon <timothycpoon@gmail.com>

"""

import re
import json
import requests
from datetime import datetime

class TubeFeed(object):
	""" Gather video feed for a YouTube channel

	"""

	API_KEY = 'dummy-key'
	CHANNEL_ID = 'UC4pYi_L7cYrM5i1iWHV4_qQ'
	SEARCH_BASE = 'https://www.googleapis.com/youtube/v3/search?part=id,snippet&key=%s&channelId=%s&maxResults=50&order=date&type=video'
	VIDEO_BASE = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&key=%s&id=%s'

	def __init__(self, api_key=None, channel_id=None, max_items=2):
		""" Initialize values

		:param api_key: API Key for the YouTube API
		:type api_key: str
		:param channel_id: ID of channel to generate feed
		:type channel_id: str
		:param max_items: Maximum number of items to fetch
		:type max_items: int

		"""
		if api_key and not isinstance(api_key, str):
			raise TypeError('API Key must be a string')
		else:
			self.api_key = TubeFeed.API_KEY

		if channel_id and not isinstance(channel_id, str):
			raise TypeError('Channel ID must be a string')
		else:
			self.channel_id = TubeFeed.CHANNEL_ID

		try:
			max_items = int(max_items)
		except TypeError:
			raise TypeError('Item maximum must be an int')

		self.max_items = max_items
		self.next_page = None

	def get_feed(self):
		""" Create the objects for the feed

		:returns: list

		"""
		videos = []
		while len(videos) < self.max_items and self.next_page is not False:
			items = self.get_page(self.next_page)
			for item in items:
				if len(videos) >= self.max_items:
					break
				videos.append({
					'youtube_id': item['id'],
					'title': item['snippet']['title'],
					'description': item['snippet']['description'],
					'published_at': TubeFeed.to_datetime(item['snippet']['publishedAt']).isoformat(),
					'thumbnail': TubeFeed.get_thumbnail(item['snippet']['thumbnails']),
					'duration': TubeFeed.extract_duration(item['contentDetails']['duration']),
				})
		return videos

	def get_page(self, page_token=None):
		if not isinstance(page_token, str) and page_token is not None:
			raise TypeError('pageToken value must be a string')

		url = TubeFeed.SEARCH_BASE % (self.api_key, self.channel_id)
		if page_token:
			url = '%s&pageToken=%s' % (url, page_token)

		req = requests.get(url)
		if req.status_code != 200:
			req.raise_for_status()

		data = json.loads(req.text)
		self.next_page = data['nextPageToken'] if 'nextPageToken' in data else False

		ids = []
		for item in data['items']:
			ids.append(item['id']['videoId'])

		return self.get_batch(ids)

	def get_batch(self, batch):
		""" Get a bunch of ID'd videos and return them

		:param batch: List of IDs
		:type batch: list
		:returns: list

		"""
		if type(batch) is not list:
			raise TypeError('Batch must be a list of IDs')

		req = requests.get(TubeFeed.VIDEO_BASE % (self.api_key, ','.join(batch)))
		if req.status_code != 200:
			req.raise_for_status()

		data = json.loads(req.text)
		return data['items']

	@staticmethod
	def to_datetime(value):
		""" Turn a string into a datetime

		:param value: String to convert
		:type value: str
		:returns: datetime

		"""
		return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")

	@staticmethod
	def get_thumbnail(thumbs):
		""" Find the highest resolution thumbnail available

		:param thumbs: List of thumbnails from the YouTube API
		:type thumbs: list
		:returns: str

		"""
		if 'maxres' in thumbs:
			return thumbs['maxres']['url']
		if 'standard' in thumbs:
			return thumbs['standard']['url']
		if 'high' in thumbs:
			return thumbs['high']['url']
		if 'medium' in thumbs:
			return thumbs['medium']['url']
		if 'default' in thumbs:
			return thumbs['default']['url']
		raise ValueError('No thumbnails available')

	@staticmethod
	def extract_duration(value):
		""" Turn a YouTube API duration string into a more usable thing

		:param value: String to sift through
		:type value: str
		:returns: str

		"""
		if not isinstance(value, str):
			raise TypeError('Value must be a string')

		ret = '%s%s%s'
		hour = re.search(r'(\d+)H', value)
		minute = re.search(r'(\d+)M', value)
		second = re.search(r'(\d+)S', value)

		if hour and minute:
			minute = '%s:' % minute.group(1).zfill(2)
		elif minute:
			minute = '%s:' % minute.group(1)
		else:
			minute = '0:'

		hour = '%s:' % hour.group(1) if hour else ''
		second = second.group(1).zfill(2) if second else '00'

		return ret % (hour, minute, second)


class GramFeed(object):
	""" Generate feeds for Instagram

	"""

	USER_ID = 2983543419
	CLIENT_ID = 'dummy-key'
	MEDIA_ENDPOINT = 'https://api.instagram.com/v1/users/{user_id}/media/recent/?client_id={client_id}'

	def __init__(self, client_id=None, user_id=None, max_items=3):
		""" Initialize values

		:param client_id: Client ID for the Instagram API
		:type client_id: str
		:param user_id: ID of user to generate feed
		:type user_id: int
		:param max_items: Maximum number of items to fetch
		:type max_items: int

		"""
		if client_id and not isinstance(client_id, str):
			raise TypeError('Client ID must be a string')
		else:
			self.client_id = GramFeed.CLIENT_ID

		if user_id:
			try:
				user_id = int(user_id)
			except TypeError:
				raise TypeError('User ID must be an int')
		else:
			self.user_id = GramFeed.USER_ID

		try:
			max_items = int(max_items)
		except TypeError:
			raise TypeError('Item maximum must be an int')

		self.max_items = max_items

	def get_feed(self):
		""" Create the objects for the feed

		:returns: list

		"""
		req = requests.get(
			self.MEDIA_ENDPOINT.format(user_id=self.user_id, client_id=self.client_id))

		if req.status_code != 200:
			req.raise_for_status()

		feed = []
		data = json.loads(req.text)['data']

		for i in range(0, len(data)):
			if len(feed) >= self.max_items:
				break
			feed.append({
				'link': data[i]['link'],
				'image': data[i]['images']['standard_resolution']['url'],
				'caption': data[i]['caption']['text'],
			})
		return feed


if __name__ == '__main__':
	FHANDLE = open('js/feeds.js', 'w')
	FHANDLE.write('var FEEDS = {data};'.format(data=json.dumps({
		'YOUTUBE': TubeFeed().get_feed(),
		'INSTAGRAM': GramFeed().get_feed(),
	})))
	FHANDLE.close()
