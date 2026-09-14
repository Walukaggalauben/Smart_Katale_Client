import React from "react"
import Stack from "@mui/joy/Stack"
import Grid from "@mui/joy/Grid"
import Typography from "@mui/joy/Typography"
import SmartForm from "./form"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/joy/Box"
import {FaEnvelope,FaEnvelopeOpen,FaInstagram,FaMapMarkerAlt, FaPhoneAlt, FaTiktok, FaWhatsapp } from "react-icons/fa"
import Contact from '/images/contact.png'
import SmartAgents from '/images/smart_agents.png'
import {Card, CardContent, List, ListItem, ListItemContent, ListItemDecorator } from "@mui/joy"
import { ContactUsFooterFormFields } from "../../configs/form_fields"

const Footer = () => {
  return (
   <FooterLargeDevices />
  )
}

export default Footer;

const FooterLargeDevices = () => {
const navigate = useNavigate()
const [isloading, setIsloading] = useState(false)
const userMessage: { customer_name: string; email: string; subject: string; message: string } = {
    customer_name: '',
    email: '',
    subject: '',
    message: ''
  }
const [FeedBackFormData, setFeedBackFormData] = React.useState<{ [key: string]: string }>(userMessage);

const isFormValid = (): boolean => {
  return Object.entries(FeedBackFormData).every(
    ([_key, value]: [string, any]) => value !== "" && value !== null && value !== undefined
  );
};

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!isFormValid()) {
      return;
    }
    
    setIsloading(true);
  
    const { customer_name, email, subject, message } = FeedBackFormData;
    const mailtoLink = `mailto:hassanprogrammer256@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Name: ${customer_name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;
    
    // Open default email client
    window.location.href = mailtoLink;
    
    // Reset form after sending
    setFeedBackFormData({
      customer_name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    setIsloading(false);
    navigate('/');
}
 
  return (
    <Stack direction='column' sx={{ backgroundColor: '#035A54' }}>
      <Typography 
        component='h1' 
        sx={{ 
          textAlign: 'center', 
          fontSize: '2rem', 
          color: 'white',
        }} 
      >
        NEW TO MINIFY GADGETS?
      </Typography>

<Box sx={{backgroundColor:'black'}}>
 <Typography component='h1' sx={{color:'white',marginBottom:'2px',textTransform:'capitalize',textAlign:'center',fontSize: '2rem',fontWeight:{md:800},fontFamily:"Alumni Sans Pinstripe"}}>About Us</Typography>

      <Grid
        container
        columns={{ xs:1}}
        sx={{
          width: '100%',
          paddingX:{md:2},
          marginBottom:1,
        }}
      >
   {/* details data */}
        <Grid xs={1} sx={{ paddingX:0,paddingY:1 ,marginX:1}}>

      <Card variant="soft" color="success">
        <CardContent>
    <List>
      {/* Location */}
  <ListItem   sx={{display:'block',marginBottom:'.5rem'}}>
          <ListItemDecorator sx={{alignItems:'center'}}> 
           <FaMapMarkerAlt size={20} className="bg-black rounded-full text-white p-1 mx-3 mb-0" />
           <Typography level="h3">Location:</Typography>
          </ListItemDecorator >
          <ListItemContent>
           
    <Typography level="body-sm" noWrap> Pioneer Mall - Shop No. PA07, Basement Floor. &#40; Opp. Mabiriizi Complex &#41;     </Typography>
        
          </ListItemContent>
        </ListItem>

     {/* telephone Numbers  and Email Address*/}
     <Grid columns={{md:2,xs:1}} sx={{display:'flex',justifyContent:'space-between'}}>
{/* 1-----Tel */}
<Grid xs={1}>
      <ListItem sx={{display:'block',marginBottom:'.5rem'}}>
          <ListItemDecorator sx={{alignItems:'center'}}> 
           <FaEnvelope size={20} className="bg-black rounded-full text-white p-1 mx-3 mb-0" />
           <Typography level="h3">Email:</Typography>
          </ListItemDecorator >
          <ListItemContent>
            
        <Typography level="body-sm" noWrap>laubenwalukagga256@gmail.com </Typography>
         
          </ListItemContent>
        </ListItem>  
</Grid>
{/* 1-----Tel */}
<Grid xs={1}>
      <ListItem sx={{display:'block',marginBottom:'.5rem'}}>
          <ListItemDecorator sx={{alignItems:'center'}}> 
           <FaPhoneAlt size={20} className="bg-black rounded-full text-white p-1 mx-3 mb-0" />
           <Typography level="h3">Tel:</Typography>
          </ListItemDecorator >
          <ListItemContent>

    <Typography level="body-sm" noWrap>+256 787808501 / +256 755062613</Typography> 
  
          </ListItemContent>
        </ListItem>  
</Grid>

     </Grid>
  



      </List>
        </CardContent>
      </Card>

        </Grid>

{/* fun facts */}
        <Grid xs={1} sx={{marginX:2}} >
      <Card variant="soft" color="success">
        <CardContent>
            <List marker="disc">

            <ListItem><Typography level="body-sm">Minify is No. 1 online electronic gadgets retailer in Uganda established in May 2019 with the  vision to become the one-stop shop for all electronic gadgets in Uganda</Typography></ListItem>

            <ListItem><Typography level="body-sm">Minify is under the leadership of Lauben Walukagga Fredrick. This website is owned and operated by The Smart Agents I.T Solutions, Kibuli.</Typography></ListItem>

            <ListItem><Typography level="body-sm">We are committed to providing exceptional customer care and ensuring our availability whenever you need us.</Typography></ListItem>

            <ListItem><Typography level="body-sm">We Offer widest range of both National and International Brands at unbeatable prices</Typography></ListItem>


      </List>
        </CardContent>
      </Card>
        </Grid>

      </Grid>

      {/* feedback form */}
     <Grid
        container
        columns={{md:2, xs:1}}
        sx={{
          width: '100%',
          backgroundColor: '#414548'
        }}
      >
   
        <Grid xs={1} sx={{ p: 2 }}>
            <Typography component='h1' sx={{color:'white',marginBottom:'2px',textTransform:'capitalize',textAlign:'center',fontSize:'2rem',fontWeight:{md:800},fontFamily:"Alumni Sans Pinstripe"}}>Message Us</Typography>
          <SmartForm
            formControls={ContactUsFooterFormFields}
           variant="solid"
           formData={FeedBackFormData}
           setFormData={setFeedBackFormData}
           isLoading = {isloading}
          buttonText= "SEND"
          onSubmit={handleSubmit}
          color="success"
          message="Sending"
    
          isBtnDisabled={!isFormValid()}
          />
        </Grid>
        <Grid xs={1} sx={{ 
          transition:'.3s all ease',
          cursor:'pointer',
          scale:.95,
          opacity:.6,
          borderRadius:'3px',
         ':hover':{
scale:1,
opacity:.9
         },
          display: {xs:'none', md:'flex'}, 


        }}>
          <img src={Contact} alt="contact_us" className="w-full"/>
        </Grid>
      </Grid>
      

</Box>
 
            <Typography component='h1' sx={{color:'white',marginBottom:'2px',textTransform:'capitalize',textAlign:'center',fontSize:'1rem',fontWeight:{md:600},fontFamily:"Alumni Sans Pinstripe"}}>Proud Partners</Typography>
<Box sx={{justifyContent:'center',display:'flex',flexDirection:'row'}}>
  <a href="https://thesmartagents.netlify.app">
    <Card variant="plain"  sx={{maxWidth:'200px',backgroundColor:'transparent',cursor:'pointer'}}>
    <img src= {SmartAgents} className="object-cover"/>
    </Card>
  </a>



</Box>

<Box sx={{display:{md:'flex'}, flexDirection:{md:'row',xs:'column-reverse'}, padding:'10px', justifyContent:'space-between',backgroundColor:'#004526',}}>
<Box sx={{display:'flex',justifyContent:'space-between',flexDirection:'row',gap:3,alignItems:'center',paddingX:2}}>
  <a href="https://wa.me/256787808501?text=Hello%20Minify%20Gadgets!" target="_blank" rel="noopener noreferrer">
    <FaWhatsapp size={20} color="white" className="cursor-pointer" />
  </a>
  <a href="https://www.tiktok.com/@reuben2560" target="_blank" rel="noopener noreferrer" aria-label="MINIFY GADGETS on TikTok">
    <FaTiktok size={15} color="white" className="cursor-pointer" />
  </a>
  <a href="https://www.instagram.com/laubengram/" target="_blank" rel="noopener noreferrer" aria-label="MINIFY GADGETS on Instagram">
    <FaInstagram size={17} color="white" className="cursor-pointer" />
  </a>
  <a href="tel:256787808501">
    <FaPhoneAlt size={15} color="white" className="cursor-pointer"/>
  </a>
  <a href="mailto:laubenwalukagga256@gmail.com">
    <FaEnvelopeOpen size={15} color="white" className="cursor-pointer"/>
  </a>
</Box>
<Typography component= 'h1' sx={{color:'gray',textAlign:'center', fontSize:{xs:'.9rem',md:'1rem'}}}>© {new Date().getFullYear()} | MINIFY GADGETS PHONES AND ACCESSORIES</Typography>
</Box>

      {/* Floating WhatsApp contact button — available across the site */}
      <Box
        component="a"
        href="https://wa.me/256787808501?text=Hello%20Minify%20Gadgets!"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Minify Gadgets on WhatsApp"
        title="Chat with Minify Gadgets on WhatsApp"
        sx={{
          position: 'fixed',
          right: { xs: 16, sm: 24 },
          bottom: { xs: 18, sm: 24 },
          zIndex: 1500,
          width: { xs: 54, sm: 60 },
          height: { xs: 54, sm: 60 },
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#25D366',
          color: 'white',
          textDecoration: 'none',
          boxShadow: '0 6px 20px rgba(0,0,0,.28)',
          transition: 'transform .2s ease, box-shadow .2s ease',
          '&:hover': {
            transform: 'scale(1.08)',
            boxShadow: '0 8px 26px rgba(0,0,0,.35)',
          },
        }}
      >
        <FaWhatsapp size={30} color="white" />
      </Box>
    </Stack>
  )
}