import sys, json

def read_data():
	lines = sys.stdin.readlines()
	# these are arguments
	return json.loads(lines[0])

def main():
	result = read_data()
	# now result above, contain arguments which can be 
	# a dict or a list, use as you need
	print result


if __name__ == '__main__':
	main()