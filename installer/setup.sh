echo "Copy the udev rules file to the correct location"
sudo cp 99-FireTVRemote.rules /etc/udev/rules.d/

echo "Create a symbolic device"
sudo udevadm trigger

echo "Reload the udev rules"
sudo udevadm control -R

