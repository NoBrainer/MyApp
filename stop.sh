
# stop the service
sudo service copycatco stop

# stop the forever processes
forever stopall

# stop the process running on port 8080
fuser -k 8080/tcp

# delete the service pid file
sudo rm /var/run/CopycatCo.pid
