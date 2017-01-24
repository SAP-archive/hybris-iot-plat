# Hybris Labs Plat
Plat is a blueprint for connecting IoT elements. It leverages MQTT to communicate with the cloud in real-time and includes hardware files to help you get started quickly.

![Bullseye Architecture](./docs/plat_bullseye_architecture.png)

It's derived from a bigger project at [Hybris Labs](http://labs.hybris.com/tag/bullseye/). The components that are open sourced include all hardware files and the software running on the microcontrollers and Raspberry Pi. It allows you to build a plug&play IoT system of your own desire that connects to the internet via the MQTT protocol.

## Directory Structure
The following directories are part of this project:

	|
	|->arduino		All firmware for microcontrollers	
	|->client		Node.js client app running on a Raspberry PI
	|->docs			Images for this README
	|->hardware		OpenSCAD source files and ready to use STL files for printing a case
	
## Requirements
- One or more [Adafruit Playground](https://www.adafruit.com/products/3000) development boards
- Access to an MQTT Broker, local is fine for testing. We recommend to setup [MOSCA](https://github.com/mcollina/mosca).
- The idea is to run the client/client.js script on a Raspberry Pi with Node installed, but for testing you can as well run the script on a *nix system as Mac OS X for example
	
## Getting Started

To get started the easy way, we recommend that you buy a few Adafruit Playground boards and use tem initially instead of your own custom hardware. You will need to flash the Arduino code located in the arduino folder onto the Adafruit Circuit Playground boards and then need to use the numberDevices.js script located in client folder to write a unique ID into the EEPROM of each board.

Next, we recommend to setup your own local or remote MQTT server for testing. In our demos, we often use MOSCA which is pretty easy to setup. 

Open the client/options.js.template file, fill in your MQTT data and save the file to options.js.

Finally, you need to run the client/client.js script via 
	
	node client/client.js
	
Once you connect a platform or an Adafruit Playground board, it should not detect teh new USB device, request the ID of it and add it to the list of connected devices.

To test the setup, you can run one of the test scripts located in the client/test folder. 

	node client/test/mqttPublishBaseCommands.js 
	
This script will send random commands to the platforms which results in the LEDs being turned on. The difference between the mqttPublishBaseCommands and mqttPublishCommands script is that mqttPublishBaseCommands sends out commands for all platforms of a base station (and not individual platforms only). It's great for testing.

Have fun!


## Setting up a Raspberry PI 
The code contained in the client directory is intended to run on a Raspberry PI. Please follow these instructions to setup a PI that will start the plat client software automatically upon start.

1. Go to the [Raspberry Pi homepage](https://www.raspberrypi.org/downloads/raspbian/), click on downloads and download the latest raspbian lite image. As there is no UI involved, we prefer the lite image.
2. Use the linux tool dd (if you are familiar with it) or simply use the great [etcher.io](https://etcher.io/) to burn the downloaded Raspbian .img file onto an Micro SD card. We recommend an 8GB SD card.
3. Connect the Raspberry Pi to the internet via a LAN cable, pop in the SD card and power it up. We need to get access to the console, which you can get to via SSH, a connected keyboard/screen or an FTDI cable. Choose what works best for you. 
4. Fire up raspi-config (`sudo raspi-config`) and perform the recommended changes/actions:
  1. Expand the file system
  2. Change the password
  3. Change the hostname to 'plat' - if you plan to have more thatn one base in the same network, choose plat1, plat2, etc.
5. Reboot, then run sudo apt-get update followed by sudo apt-get upgrade
6. Next, we install a current version of node. Head over to nodejs.org and download the latest ARMv7 binary. 
`wget https://nodejs.org/dist/v6.9.4/node-v6.9.4-linux-armv7l.tar.xz` 
`tar -xvf node-v6.9.4-linux-armv7l.tar.xz`
`cd node-v6...` 
`sudo cp -R * /usr/local/`
7. Run `node --version` and `npm --version` to verify the proper installation
8. Using `npm` we will now install forever-service, and forever.
  1. Run `sudo  npm install -g forever-service ` and
  2. next `sudo npm install -g forever`
9. Install git as we will later clone this repo onto the Pi. Just run `sudo apt-get install git`
10. Although we only need the client directory on the Pi, it is more convenient to just clone the complete repo. Run `git clone https://github.com/SAP/hybris-iot-plat.git` and make sure you are in the home directory before you run this (run `cd ` in case)
11. `cd hybris-iot-plat/client`
12. Now run `npm install` to install all dependencies.
13. Copy `options.js.template` to `options.js` and change the file to your needs. This step is critical. If you are not connecting to the hybris labs backend, you will initially just need to add the mqtt information. If you prep the client for teh hybris labs bullseye backend services, then contact hybris labs for the correct settings for the mqtt broker as well as the tenant and base config.
14. At this point, you can run `node client.js` and see if the client is running correctly. Once started, it should connect to the mqtt broker and scan for platforms that are connected via USB. As this script is not starting automatically, we now use forever-service to setup a service at startup.
15. Still in the `client` directory, run `sudo forever-service install plat -s client.js -r pi` and take note of the service commands to start/stop/restart the service as you might need them later on. Check the status and start the service if it is not started.
16. At this point, you can run `sudo reboot` and the Pi should start the client software automatically.
17. Congrats, you're running a plat client!
