import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import Button from '../components/Button'

const welcome = () => {
    const router = useRouter();
  return (
   <ScreenWrapper>
    <StatusBar style="dark" />
    <View style={styles.container}>
        <Image style={styles.welcomeImage} resizeMode='stretch' source={require('../assets/images/image.png')} />
        <View style={{gap: 20}}>
                <Text style={styles.title}>Thryve</Text>
                <Text style={styles.punchline}>
                    Get the coach you deserve
                </Text>
            </View>

            <View style={styles.footer}>
                <Button 
                title="Get Started"
                buttonStyle={{marginHorizontal: wp(3)}}
                onPress={()=>{router.push('signUp')}}

                />
          </View>
      </View>


    </ScreenWrapper>
  )
}

export default welcome

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'space-around',
        alignItems:'center',
        backgroundColor:'white',
        paddingHorizontal: wp(4)
    },
    welcomeImage:{
        height: hp(40),
        width: wp(95),
        alignSelf:'center',
    },
    title:{
        color: theme.colors.text,
        fontSize: hp(4),
        textAlign:'center',
        fontWeight: theme.fonts.extraBold
    },
    punchline:{
        textAlign:'center',
        paddingHorizontal: wp(10),
        fontSize: hp(1.7),
        color: theme.colors.text,
    },
    footer:{
        gap: 30,
        width: '100%',
        //marginBottom: hp(4),
    },
    bottomTextContainer:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        gap: 5,
    },
    loginText:{
        textAlign:'center',
        color: theme.colors.text,
        fontSize: hp(1.6),
    }
});