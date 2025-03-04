import express from "express";
import { MemberRole, PrismaClient } from "@prisma/client";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { storage } from "./cloudConfig.js";
import { v4 as uuidv4 } from 'uuid';
import { createServer } from "http";
import { Server } from "socket.io";
import { AccessToken } from "livekit-server-sdk";





dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;


const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    
  },
});

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(
  ClerkExpressWithAuth({
    apiKey: process.env.CLERK_SECRET_KEY,
  })
);
app.use(express.json());
app.use(cors(corsOptions));



const upload = multer({ storage });


app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    
    const cloudinaryUrl = req.file.path;
    console.log("File uploaded to Cloudinary: ", cloudinaryUrl);

 
    const fileDetails = {
      fileUrl: cloudinaryUrl, 
      uploadedAt: new Date().toISOString(),
    };

    res.status(200).json({
      message: "File uploaded and details stored successfully",
      fileDetails, 
    });
  } catch (error) {
    console.error("Error uploading file and storing details: ", error);
    res.status(500).json({ error: "Failed to upload file and store details" });
  }
});

app.post("/server", async (req, res) => {
  let { name, imageUrl, user } = req.body;
  console.log("user is : ", user.id);


  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      servers: true,
    },
  });

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }


  const inviteCode = uuidv4();


  let server = await prisma.server.create({
    data: {
      name: name,
      imageUrl: imageUrl,
      inviteCode: inviteCode,
      profileId: profile.id,
      channels: {
        create: [
          { name: "general", profileId: profile.id }
        ]
      },
      members: {
        create: [
          { profileId: profile.id, role: MemberRole.ADMIN }
        ]
      }
    },
  });


  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      servers: {
        connect: { id: server.id },
      },
    },
  });



  const serverId = server.id;

  res.status(200).json({
    message: "Server details stored successfully",
    serverId, server
  });
});


app.get("/profile/:id", async (req, res) => {
  let { id } = req.params;

  try {

    let profile = await prisma.profile.findUnique({
      where: { userId: id },
      include: {
        servers: {
          include: {
            members: true, // ✅ Fetch members inside servers
          },
        },
      },
    });


    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }


    res.status(200).json(profile);
  } catch (error) {

    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "An error occurred while fetching the profile" });
  }
});

app.patch('/servers/:serverId/invite-code/:userId', async (req, res) => {
  let { serverId, userId } = req.params;

  try {
    let server = await prisma.server.findUnique({
      where: {
        id: serverId
      }
    });

    let profile = await prisma.profile.findUnique({
      where: {
        id: userId
      }
    });

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    const newInviteCode = uuidv4();

    await prisma.member.create({
      data: {
        profileId: profile.id,
        serverId: server.id
      }
    });

    await prisma.server.update({
      where: {
        id: serverId
      },
      data: {
        inviteCode: newInviteCode
      }
    });

    res.status(200).json({ inviteCode: newInviteCode, server });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the invite code." });
  }
});


app.get('/invite/:inviteCode/:userId', async (req, res) => {
  let { inviteCode, userId } = req.params;



  try {
    let server = await prisma.server.findUnique({
      where: { inviteCode: inviteCode },
      include: { members: true, channels: true } // Fetch existing members
    });

    if (!server) {
      return res.status(400).json({ error: "Invalid invite code." });
    }

    let profile = await prisma.profile.findUnique({  // Added `await`
      where: { userId: userId }
    });

    if (!profile) {
      return res.status(400).json({ error: "Profile not found." });
    }

    // Check if the user is already a member
    const isMember = server.members.some(member => member.profileId === profile.id);

    if (!isMember) {
      // Add the user to the server
      await prisma.member.create({ // Corrected member creation
        data: {
          profileId: profile.id, // Use `profileId` instead of `userId`
          serverId: server.id
        }
      });
    }

    res.status(200).json({ serverId: server.id, message: "Joined successfully!", server: server });

  } catch (error) {
    console.error("Error joining server:", error);
    res.status(500).json({ error: "An error occurred while processing the invite." });
  }
});



app.get("/servers/:id", async (req, res) => {
  let { id } = req.params;

  try {

    let profile = await prisma.profile.findUnique({
      where: { userId: id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }


    let servers = await prisma.server.findMany({
      where: {
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true
          }
        },
        channels: true
      },
    });



    res.status(200).json(servers);
  } catch (error) {

    console.error("Error fetching servers:", error);
    res.status(500).json({ error: "An error occurred while fetching servers" });
  }
});





app.post("/user", async (req, res) => {
  const { user } = req.body;

  console.log("user is : ", user?.id);

  if (!user || !user.id) {
    return res
      .status(400)
      .json({ error: "User data is missing", redirectUrl: "/sign-in" });
  }

  try {
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        servers: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.emailAddresses[0].emailAddress,
          imageUrl: user.imageUrl,
        },
      });
    }

    let userServers = await prisma.server.findMany({
      where: {
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: {
          include: { profile: true },
        },
        channels: true,
      },
    });

    if (userServers.length === 0) {
      return res.json({ redirectUrl: "/server", user: profile });
    }

    let serverPass = userServers[0]; // Ensuring that userServers has elements
    let serverId = serverPass.id;

    const currMember = await prisma.member.findFirst({
      where: {
        serverId: serverId,
        profileId: profile.id,
      },
      include: {
        profile: true,  // Include the related profile
        server: true,   // Include the related server
      },
    });
    

    if (serverPass.channels.length === 0) {
      return res.json({
        redirectUrl: `/server/${serverId}`,
        serverId,
        user: profile,
        currServer: serverPass,
        currMember,
      });
    }

    const channelId = serverPass.channels[0].id;
    return res.json({
      redirectUrl: `/server/${serverId}/channels/${channelId}`,
      serverId,
      user: profile,
      currServer: serverPass,
      currMember,
      currChannel: serverPass.channels[0],
    });
  } catch (error) {
    console.error("Error creating/finding profile:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/member/:serverId/:userId", async (req, res) => {
  try {
    const { serverId, userId } = req.params;

    const currMember = await prisma.member.findFirst({
      where: {
        serverId: serverId,
        profileId: userId,  
      },
      include: {
        profile: true,
        server: true,
      },
    });

    if (!currMember) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(currMember);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});








app.patch("/servers/:serverId", upload.single("file"), async (req, res) => {
  try {
    const { serverId } = req.params;
    const { user, name, imageUrl } = req.body;
    const id = user?.id;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: id },
    });

    if (!profile) {
      return res.status(400).json({ error: "Profile is required" });
    }

    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: {
        members: true,
        channels: true
      },
    });

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    let currMember = server.members.find(member => member.profileId === profile.id);

    if (!currMember || currMember.role !== "ADMIN") {
      return res.status(403).json({ error: "Access Denied" });
    }

    const updatedServer = await prisma.server.update({
      where: { id: serverId },
      data: {
        name,
        imageUrl,
      },
    });

    return res.status(200).json({
      success: "Server Edited Successfully",
      server: updatedServer,
    });
  } catch (error) {
    console.error("Error updating server:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.patch('/members/:memberId', async (req, res) => {
  let { memberId } = req.params;
  let { role, currUser } = req.body;
  if (!currUser) {
    return res.status(400).json({ error: "User not found" });
  }

  try {
    const member = await prisma.member.update({
      where: {
        id: memberId
      },
      data: {
        role: role
      }
    });

    return res.status(200).json({ success: "Succesfully updated the member role", updatedMember: member });
  }
  catch (error) {
    return res.status(500).json({ error: "Internal server error while updating member" });
  }


});


app.delete('/members/:memberId', async (req, res) => {
  let { memberId } = req.params;
  let { currUser } = req.body;

  if (!currUser) {
    return res.status(400).json({ error: "User not found" });
  }

  try {

    await prisma.member.delete({
      where: {
        id: memberId
      }
    });

    return res.status(200).json({ success: "Successfully deleted the member" });
  } catch (error) {
    console.error("Error deleting member:", error);
    return res.status(500).json({ error: "Internal server error while deleting member" });
  }
});

app.post('/channel', async (req, res) => {
  let { name, type, user, serverId } = req.body;

  console.log("SERVERID from app.js 486  - ", serverId);


  try {
    let profile = await prisma.profile.findUnique({
      where: {
        userId: user
      }
    });

    if (name == 'general') {
      return res.status(400).json({ error: "Name cannot be general." });
    }

    if (!profile) {
      return res.status(400).json({ error: "Profile not found" });
    }

    // Use findFirst instead of findUnique
    let member = await prisma.member.findFirst({
      where: {
        profileId: profile.id,
        serverId: serverId
      }
    });

    if (!member || member.role === 'GUEST') {
      console.log("HII MEMEBER ERROR", member, member.role);

      return res.status(400).json({ error: "Access Denied" });
    }

    let channel = await prisma.channel.create({
      data: {
        name: name,
        type: type,
        profileId: profile.id,
        serverId: serverId
      }
    });

    return res.status(200).json({ success: "Channel created successfully", channel });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error while creating channel.", details: error.message });
  }
});


app.get('/servers/:serverId/:userId', async (req, res) => {
  let { serverId, userId } = req.params;


  if (!userId || !serverId) {
    return res.status(400).json({ error: "User or Server is not found." });
  }

  try {
    const profile = await prisma.profile.findFirst(
      {
        where: {
          userId: userId
        }
      }
    );



    if (!profile) {
      return res.status(400).json({ error: "User not found." });
    }
    const deletedMember = await prisma.member.deleteMany({
      where: {
        profileId: profile.id,
        serverId: serverId
      }
    });

    if (deletedMember.count === 0) {
      console.log("Hii");

      return res.status(404).json({ error: "Member not found in the server." });
    }



    return res.status(200).json({ success: "Channel left successfully" });
  } catch (error) {
    console.error("Error while leaving channel:", error);
    return res.status(500).json({ error: "Error while leaving server.", details: error.message });
  }
});


app.delete('/servers/:serverId', async (req, res) => {
  let { serverId } = req.params;
  if (!serverId) {
    return res.status(404).json({ error: "Invalid serverId." });
  }
  try {
    const deletedServers = await prisma.server.deleteMany(
      {
        where:
        {
          id: serverId
        }
      }
    );

    return res.status(200).json({ success: "Channel deleted successfully." })

  } catch (error) {
    return res.status(500).json({ error: "Error while deleting server.", details: error.message })
  }
});

app.delete('/channels/:channelId',async(req,res)=>{
  let { channelId } = req.params;
  if (!channelId) {
    return res.status(404).json({ error: "Invalid serverId." });
  }
  try {
    const deletedhannel = await prisma.channel.deleteMany(
      {
        where:
        {
          id: channelId
        }
      }
    );

    return res.status(200).json({ success: "Channel deleted successfully." })

  } catch (error) {
    return res.status(500).json({ error: "Error while deleting server.", details: error.message })
  }
})


app.patch('/channels/:channelId', async (req, res) => {
  try {
    let { channelId } = req.params;
    let { name, type, user } = req.body;
    let userId = user?.user?.id; // Ensure user ID is properly accessed

    if (!userId) {
      return res.status(400).json({ error: "User not found." });
    }

    const profile = await prisma.profile.findFirst({
      where: {
        userId: userId
      }
    });

    if (!profile) {
      return res.status(400).json({ error: "User profile not found." });
    }

    const channel = await prisma.channel.findUnique({ 
      where: {
        id: channelId
      }
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found." });
    }

    const updatedChannel = await prisma.channel.update({
      where: {
        id: channelId
      },
      data: {
        name: name,
        type: type
      }
    });

    return res.status(200).json({ message: "Channel updated successfully.", channel: updatedChannel });

  } catch (error) {
    console.error("Error updating channel:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});


app.post("/messages", async (req, res) => {
  try {
    let { channelId, serverId, content, profileId, fileUrl } = req.body;
    
    if (!profileId) {
      console.log("hii user");
      
      return res.status(404).json({ message: "User not found" });
    }

    const server = await prisma.server.findFirst({
      where: { id: serverId },
    });
    if (!server) {
      console.log("hii server");
      
      return res.status(404).json({ message: "Server not found" });
    }

    const channel = await prisma.channel.findFirst({
      where: { id: channelId },
    });
    if (!channel) {
      console.log("hii channel");
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if the member exists
    const member = await prisma.member.findFirst({
      
      where: { profileId: profileId,serverId:serverId },
    });
    if (!member) {
      console.log("hii member");
      return res.status(404).json({ message: "Member not found" });
    }

    const newMessage = await prisma.message.create({
      data: {
        content: content,
        fileUrl: fileUrl || null, 
        memberId: member.id, 
        channelId: channelId,
      },
      include:{
        member:{
          include:{
            profile:true
          }
        },
        channel:true
      }
    });

    const dataToSend = {...newMessage,createdAt:newMessage.createdAt,updatedAt:newMessage.updatedAt,deleted:false}

    return res.status(201).json({ message: "Message sent successfully", dataToSend });
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


app.post("/directMessages", async (req, res) => {
  try {
    let { conversationId, content, profileId, fileUrl, otherMember, currMember } = req.body;

    
    

    if (!profileId) {
      console.log("hii user");
      return res.status(404).json({ message: "User not found" });
    }

    if (!otherMember?.id || !currMember?.id) {
      console.log("hii member");
      return res.status(404).json({ message: "Member not found" });
    }

    const newMessage = await prisma.directMessage.create({
      data: {
        content,
        fileUrl: fileUrl || null,
        memberId: currMember.id,
        conversationId
      },
      include: {
        member: {
          include: {
            profile: true
          }
        },
        conversation: true
      }
    });

    const dataToSend = {...newMessage,createdAt:newMessage.createdAt,updatedAt:newMessage.updatedAt,deleted:false}

    return res.status(201).json({ message: "Message sent successfully", dataToSend });
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



app.get("/messages/:channelId", async (req, res) => {
  const { channelId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        channelId: channelId,
      },
      include: {
        member: {
          include: {
            profile: true, 
          },
        },
        channel: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});



app.get("/channels/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(404).send("UserId missing");
  }

  try {
    
    let profile = await prisma.profile.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!profile) {
      return res.status(404).send("Profile not found.");
    }

    
    const servers = await prisma.server.findMany({
      where: {
        members: {
          some: {
            profileId: profile.id, 
          },
        },
      },
      include: {
        members: true, 
        channels: true, 
      },
    });

    const channelId = [];

   
    servers.forEach((server) => {
      const channels = server.channels;
      channels.forEach((channel) => {
        channelId.push(channel.id);
      });
    });

    
    return res.status(200).json({ channels: channelId });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal Server Error");
  }
});


app.patch("/messages/:msgId", async (req, res) => {
  const { msgId } = req.params;
  const { content, userId, currentMember } = req.body;

  try {

    const profile = await prisma.profile.findUnique({
      where: { userId: userId }
    });

    if (!profile) {
      console.log("hii profile");
      
      return res.status(400).send("Profile does not exist");
    }

    
    if (!currentMember || currentMember.role !== "ADMIN") {
      console.log("hii member",currentMember);
      return res.status(403).send("Unauthorized access.");
    }

   
    const message = await prisma.message.findUnique({
      where: { id: msgId }
    });

    if (!message) {
      console.log("hii message");
      return res.status(404).send("Message not found.");
    }

    await prisma.message.update({
      where: { id: msgId },
      data: { content: content }
    });



    return res.status(200).send("Message edited successfully");
  } catch (error) {
    console.error("Error updating message:", error);
    return res.status(500).send("Internal server error");
  }
});


app.get("/conversation/:serverId/:memberOneId/:memberTwoId", async (req, res) => {
  try {
    const { serverId, memberOneId, memberTwoId } = req.params;
   
    

    if (!serverId || !memberOneId || !memberTwoId) {
      console.log("initial");
      
      return res.status(400).send("No server/members are found.");
    }

    // Need to await this promise
    const server = await prisma.server.findUnique({
      where: {
        id: serverId
      },
      include: {
        members: true
      }
    });

    if (!server) {
      console.log("server nhi");
      
      return res.status(400).send("No server found.");
    }

    const isMemberOne = server.members.find((member) => member.id === memberOneId);
    const isMemberTwo = server.members.find((member) => member.id === memberTwoId);

    // Check if both members exist
    if (!isMemberOne || !isMemberTwo) {
      console.log("memeber nahi");
      
      return res.status(400).send("Unauthorized access");
    }

    // Need to await this promise and fix the where clause syntax
    const conversation = await prisma.conversation.findFirst({
      where: {
        serverId: serverId,
        OR: [
          {
            AND: [
              { memberOneId: memberOneId },
              { memberTwoId: memberTwoId }
            ]
          },
          {
            AND: [
              { memberOneId: memberTwoId },
              { memberTwoId: memberOneId }
            ]
          }
        ]
      },
      include: {
        memberOne: {
          include: {
            profile: true
          }
        },
        memberTwo: {
          include: {
            profile: true
          }
        },
        directMessages: {
          include:{
            member:
            {
              include:{
                profile:true
              }
            },
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!conversation) {
      
      const newConversation = await prisma.conversation.create({
        data: {
          serverId: serverId,
          memberOneId: memberOneId,
          memberTwoId: memberTwoId
        },
        include: {
          memberOne: {
            include: {
              profile: true
            }
          },
          memberTwo: {
            include: {
              profile: true
            }
          },
          directMessages:{
            include:{
              member:{
                include:
                {
                  profile:true
                }
              }
            }
          }
        }
      });
     
      
      return res.status(200).json(newConversation);
    }

    
    
    

    return res.status(200).json(conversation);

  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



app.get("/getApitoken", async(req, res) => {
  const { room, username } = req.query;

  // Validate query parameters
  if (!room) {
    return res.status(400).json({ error: 'Missing "room" query parameter' });
  } else if (!username) {
    return res.status(400).json({ error: 'Missing "username" query parameter' });
  }

  // Check for required environment variables
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  try {
    // Create access token with explicit string conversion
    const at = new AccessToken(apiKey, apiSecret, {
      identity: String(username),
      ttl: 3600 // Token valid for 1 hour
    });

    // Add room grant
    at.addGrant({ 
      room: String(room), 
      roomJoin: true, 
      canPublish: true, 
      canSubscribe: true 
    });

    // Generate and return the token
    const token =await at.toJwt();
    
    console.log('Generated Token:', token); // Log the token for debugging
    
    res.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token', details: error.message });
  }
});




app.delete("/messages/:msgId",async(req,res)=>{
  const { msgId } = req.params;
  const {userId, currentMember } = req.body;

  try {

    const profile = await prisma.profile.findUnique({
      where: { userId: userId }
    });

    if (!profile) {
      
      console.log("hii profile from delete");
      
      return res.status(400).send("Profile does not exist");
    }

    
    if (!currentMember || currentMember.role === "GUEST") {
      console.log("hii member from delete",currentMember);
      return res.status(403).send("Unauthorized access.");
    }

   
    const message = await prisma.message.findUnique({
      where: { id: msgId }
    });

    if (!message) {
      console.log("hii message");
      return res.status(404).send("Message not found.");
    }

    

    await prisma.message.update({
      where: { id: msgId },
      data: { deleted: true }
    });

    


    return res.status(200).send("Message deleted successfully");
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).send("Internal server error");
  }
});





//socket routes : 

const onlineUsers = new Map(); 

io.on("connection", (socket) => {
  console.log("A user connected (serverSide):", socket.id);

  socket.on("userConnected",(userId)=>{
      console.log(`user ${userId} came online`);
      onlineUsers.set(userId, socket.id);
      
      
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys())); 
  });

  socket.on("joinRoom",(data)=>{
    
    console.log("User joined room - ",data);
    
    socket.join(data);
  });


  

  socket.on("disconnect", () => {
    
    const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
    if (userId) onlineUsers.delete(userId);
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys())); // Broadcast update
  });

  

  socket.on("chatMessage",(msg)=>{ 
    io.to(msg.channelId).emit("chatMessage",msg);
  });


  socket.on("directMessage",(msg)=>{
    console.log("msg 1:1 - ",msg);


   
    io.to(msg.conversation.memberTwoId).emit("directMessage", msg);

   
  });

  socket.on("messageUpdate",(data)=>{
    const {id,content,channelId} = data;
    

    io.to(channelId).emit("updateMessageData",data);
  });

  socket.on("messageDelete",(data)=>{
    const {id,channelId} = data;

    io.to(channelId).emit("deleteMessageData",data);

  });
});


// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
