import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'
import { hp, wp } from '../constants/helper/common'

const welcome = () => {
    const router = useRouter();
  return (
    <ScreenWrapper bg={theme.colors.primary}>
        {/* status bar is used to select the color of the elements on top (like time, battery and stuff) */}
        <StatusBar style="dark"/>
        <View style={styles.container}>
                <Image style={styles.welcomeImage} resizeMode='contain' source={""}/>

            {/* Title and shit */}
            <View style={{gap: 30}}>
                <Text style={styles.title}>Shine AI</Text>
                <Text style={styles.punchline}>Hi! I am Shine AI, Your Own Personal Beauty Coach.</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Button title="Get Started   →"
                buttonStyle={{marginHorizontal: wp(3)}}
                onPress={()=>router.push('HowItWorksPage')}/>
            </View>
        </View>
    </ScreenWrapper>
  )
}

export default welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: wp(4),
    },
    welcomeImage:{
        height: hp(40),
        width: wp(95),
        alignSelf:'center',
        marginBottom: hp(-20)
        
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(5),
        textAlign:'center',
        fontWeight: theme.fonts.extraBold
        
    },
    punchline: {
        textAlign:'center',
        paddingHorizontal: wp(10),
        fontSize: hp(2.7),
        color: theme.colors.text,
    },
    footer:{
        gap: 30,
        width: '100%',
    },

})