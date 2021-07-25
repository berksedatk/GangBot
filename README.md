# GangBot
**GangBot** is a discord bot created by **Sax#6211** and **noodle#0001**, with GangBot you can create Gangs, join Gangs and manage them. GangBot is the best way to have groups of friends and cooperate with them to be the top Gang in your server!

## Getting Started
To invite GangBot to your server, click [here.](https://discord.com/api/oauth2/authorize?client_id=668705498467401728&permissions=268823617&scope=bot%20applications.commands) After inviting the bot to your server simply use the `g?create` to get started on making a Gang!

You can only be in a single gang at a time and if you join a gang, you will have a 30 minute cooldown before leaving it.

Remember, the first time you invite the bot everyone in your server will be able to create Gangs. Only a person the Administrator permissions can change this.

To prevent that you can use the `g?setcreator` command, to set the creator only for certain roles to use, for example @Mod role, you can simply use `g?setcreator role @Role` command.

If  you only wanted the Owner of the server to be able to create gangs, simply use the `g?setcreator owner` command.

Or if you would like everyone to create their own gangs simply use `g?setcreator everyone`command.

## Creating A Gang

Now let's get to creating a gang shall we?

When you use the `g?create` command you will be directed to set of instructions to create your own gang

 - Name | Can be 32 characters at max, Case Sensitive.
 - Description | Can be 4000 characters at max, you can use emojis and hyperlinks.
 - Color | Can be a Hex color, click [here](https://htmlcolorcodes.com/color-picker/) to pick a Hex color.
 - Banner | Can only be a image attachment.
 - Owner |  This is only required if you are using a role or owner creator, which is for you to be able to create Gangs for others. Takes a mention of the user you want the owner of the Gang to be.

After you create your own gang, we can get to managing it.

## Managing A Gang

To see your rank on a Gang, use the `g?profile` gang, this will also show you which gang you are in.

Let's introduce the `g?manage` command, the input of these commands change depending if you are the Owner of the gang or a Admin.

**Gang Admin/Owner Commands**
 - `g?manage description` | This command changes the Description of the Gang
 - `g?manage color` | This command changes the Color of the Gang
 - `g?manage banner` | This command changes the Banner of the Gang
 - `g?manage kick` | This command kicks a member from the Gang

**Gang Owner Only Commands**

 - `g?manage name` | This command changes the Name of the Gang
 - `g?manage setadmin` | This command sets a member's rank to Admin.
 - `g?manage removeadmin` | This command reverts a member's rank from Admin to Member.
 - `g?manage transferownership` | This command transfers the ownership of the Gang to a member of the gang.

**Server Owner/Gang Owner/Administrator Commands**
 - `g?remove` | This command removes a gang from the server, careful this command cannot be reverted once it's done.

## Support

If you have a problem or a question you can join our support server and ask us your questions. We are always open for new suggestions and feedback.

Click [here](https://discord.gg/udW5kth) to join our discord server.

## Aftermath

Gangbot v2 is running with discord.js library. The project has been going well over a year now. Thanks for everybody who helped this project to be succesful and special thanks to noodle#0001 for helping me on so many things, this project wouldn't be alive and running without any of your helps. If you would like to support us please join our support server and reach out to us. Thank you ♡
