# Auto BIRDS Tool using Node.js (Supports both No Proxy and Proxy)

## Description
Auto BIRDS is a script developed using Node.js to automate tasks in the BIRDS game. This tool offers the following main features:

- ✔️ Auto worm catching
- ✔️ Auto egg cracking
- ✔️ Auto upgrading
- ✔️ Auto tasks (automatically performs some tasks, some may not be supported)
- ✔️ Auto join guild
- 🚫 Daily missions are not supported yet, they will be included in upcoming versions.

## Requirements

- Node.js should be installed on your system.

## Installation Guide

1. **Install necessary modules**  
   Run the following command to install the required Node.js modules:
   ```bash
   npm install
2. **Create data files**  
   Create two files named data.txt and proxy.txt:

- data.txt:

  - This file must include the format query_id=xxx or user=xxxx
(you can get these values using the bypass extension).
 - proxy.txt (Only create if using multiple accounts):
   - The proxy format should be: http://user:pass@ip:port
   - If you are only using one account, there's no need to create this file.
## Run the tool

- If not using a proxy, run the following command:
   ```bash
   node birds.js
- If using a proxy, run the command:
   ```bash
   node birds-proxy.js
## Notes
- Replace the referral code  
In the source code of the tool, find and replace the referral code by:

  - Press Ctrl + F to search for the keyword 376905749 and replace it with your referral link or user ID.
  - [Register for BirdX](https://t.me/birdx2_bot/birdx?startapp=1288479303)

## File formats
- data.txt file format:

   ```bash
   query_id=xxx
 - or

   ```bash
   user=xxxx
- proxy.txt file format (if using proxy):

   ```text
   http://user:pass@ip:port
