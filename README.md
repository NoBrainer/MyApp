

# MyApp


## Setup
- Install Eclipse
- Install Node & Nodeclipse
- Download this repository
- npm install package.json
- Auto-compile LESS: Right click on the project, Properties > Builders > New...
	- Name: whatever_you_want
	- Main tab:
		- Location: ${workspace_loc:/MyApp/public/auto-compile-less}
		- Working Directory: ${workspace_loc:/MyApp}
	- Refresh tab:
		- Check "Refresh resources upon completion"
		- Specify the resources to be the directory: /public/stylesheets
	- Build Options:
		- Launch in background
		- During manual & auto builds
		- Specify working set of relevant resources: select all css files referenced in /public/auto-compile-less
- Set auto-compile-less script file to be executable
- Window > Preferences > Nodeclipse
	- Set "Node monitor path" to /node_modules/nodemon/bin/nodemon.js
	- Apply, Ok
- Add 'aggregate.js' to nodemon's ignore list (/node_modules/nodemon/lib/config/defaults.js)


## Linux Server Setup
- Install node:
	- sudo yum install node
- Add symlinks for node:
	- sudo ln -s /usr/local/bin/node /usr/bin/node
	- sudo ln -s /usr/local/lib/node /usr/lib/node
	- sudo ln -s /usr/local/bin/npm /usr/bin/npm
	- sudo ln -s /usr/local/bin/node-waf /usr/bin/node-waf
- Install forever:
	- npm install forever -g
- Add symlinks for forever:
	- sudo ln -s /usr/local/bin/forever ../lib/node_modules/forever/bin/forever
	- sudo ln -s /usr/bin/forever /usr/local/bin/forever
- Modify /etc/rc.local to reroute to ports 80 and 443 (replace ${HTTP_PORT} and ${HTTPS_PORT})
	- iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port ${HTTP_PORT}
	- iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port ${HTTPS_PORT}
	- service iptables save
- Add mongod to chkconfig
	- Make sure the mongo database is owned by mongod
		- sudo chown -R mongod /var/lib/mongo
	- Set it too run at startup
		- sudo /sbin/chkconfig --level 345 mongod on
	- Run the service
		- sudo service mongod start
- Setup init.d script for this webapp
	- Setup the copycatco service
		- sudo cp copycatco /etc/rc.d/init.d/
		- sudo chmod 0755 /etc/rc.d/init.d/copycatco
	- Set it to run at startup
		- sudo /sbin/chkconfig --level 345 copycatco on
	- Run the service
		- sudo service copycatco start

## Usage



## Developing

### PRIORITY 1
Schedule
- Improve UX

General
- Optimize for mobile

### PRIORITY 2
Schedule
- Make expanded view for employees

News
- RSS feed

Admin Panel
- Deleting users
- Changing user names
- Unlocking user accounts
- Improve UX

Jumbotron Images
- Automatically pull latest from instagram

Menu
- Setup admin uploading

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
