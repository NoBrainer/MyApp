

# MyApp


## Dev Environment Setup
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

### Setup .bashrc aliases
- Open .bashrc
	- sudo vi ~/.bashrc
- Add this:
 # CUSTOM ALIASES
 
 # ssh into server
 alias sshserver='ssh {user}@{server_ip}'
 
 # update server code
 alias updateserver='rsync -ru --delete /path/to/deployment/directory {user}@{server_ip}:bin'
- Apply changes
	- source ~/.bashrc

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
	- sudo ln -s /usr/local/bin/forever /usr/local/lib/node_modules/forever/bin/forever
	- sudo ln -s /usr/bin/forever /usr/local/bin/forever
- Modify /etc/rc.local to reroute to ports 80 and 443 (replace ${HTTP_PORT} and ${HTTPS_PORT})
	- iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port ${HTTP_PORT}
	- iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port ${HTTPS_PORT}
	- service iptables save

### Setup .bashrc aliases
- Open .bashrc
	- sudo vi ~/.bashrc
- Add this:
 # CUSTOM ALIASES
 
 # Stop/start the server
 # NOTE: Requires you to move stop.sh to ~/bin and do 'chmod +x stop.sh' on it
 alias stopServer='~/bin/stop.sh'
 alias startServer='sudo service copycatco start'
 
 # Tail the logs
 alias tailLog='tail -f /path/to/logfile.log'
- Apply changes
	- source ~/.bashrc


### Make mongo service run at server start-up
- Add mongod to chkconfig
	- Make sure the mongo database is owned by mongod
		- sudo chown -R mongod /var/lib/mongo
		- sudo chown -R mongod /data/db
	- Set it too run at startup
		- sudo /sbin/chkconfig --level 345 mongod on
	- Run the service
		- sudo service mongod start


### Make webapp service run at start-up
- Setup init.d script for this webapp
	- Setup the copycatco service
		- sudo cp copycatco /etc/rc.d/init.d/
		- sudo chmod 0755 /etc/rc.d/init.d/copycatco
	- Set it to run at startup
		- sudo /sbin/chkconfig --level 345 copycatco on
	- Run the service
		- sudo service copycatco start


### Setup rolling log files
- Add an entry in /etc/logrotate.conf
	- sudo vi /etc/logrotate.conf
	- Use the contents in logrotate.conf in this project
- The logrotate should happen from the cronjob at /etc/cron.daily/logrotate


## Deployment Process

### Stop copycatco service
From server:
- Stop the service
	- sudo service copycatco stop
- Stop all forever processes
	- forever stopall
	- OR stop individual forever process (get forever_pid from the column named 'forever')
		- forever list
		- sudo kill -9 {forever_pid}
- Check the process on port 8080
	- fuser 8080/tcp
- Kill the process on port 8080
	- fuser -k 8080/tcp
- Delete the pid file
	- sudo rm /var/run/CopyCatCo.pid
- Verify that it's stopped
	- sudo service copycatco status
	- fuser 8080/tcp

#### Deploy new code
From dev environment:
- updatecopycat
	
#### Restart copycatco service
From server:
- Start the service
	- sudo service copycatco start
- Tail the logs
	- tailCopycat

### Process Clean-up

#### Stop mongod service
- Stop the service
	- sudo service mongod stop
- Remove mongod.lock files
	- sudo rm /data/db/mongod.lock
	- sudo rm /var/lib/mongo/mongod.lock
- Delete the pid file
	- sudo rm /var/run/mongodb/mongod.pid
- Verify that the service is stopped
	- sudo service mongod status


#### Start mongod service
From server:
- Start the service
	- sudo service mongod start
- Tail the logs
	- tailMongo


### Miscellaneous Linux Commands
- Check what processes are running at start-up
	- /sbin/chkconfig --list
	- /sbin/chkconfig --list | grep copycatco
	- /sbin/chkconfig --list | grep mongod
- Check all processes running on ports
	- netstat -plten
- Kill a process with a given pid
	- sudo kill -9 {pid}


## Usage


## Developing

### PRIORITY 1
Schedule
- Edit multiple dates at once

Admin Panel
- Set name during pre-approval
- Changing user names

General
- Optimize for mobile
- Setup SSL (one-way)

### PRIORITY 2
Schedule
- Make expanded view for employees

News
- RSS feed

Admin Panel
- Deleting users
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
