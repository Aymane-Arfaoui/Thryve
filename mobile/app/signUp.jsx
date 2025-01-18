import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
// import LeftArrow from '../assets/icons/LeftArrow'
// import Icon from '../assets/icons'

const signUp = () => {
    const router = useRouter();
  return (
    <ScreenWrapper>
        <StatusBar />
      <View style={styles.container}>
            <BackButton router={router}/>

            {/* Welcome Text */}
            <View>
                <Text style={styles.WelcomeText}>Let's </Text>
                <Text style={styles.WelcomeText}>Get Started</Text>

            </View>
    </View>
    </ScreenWrapper>
  )
}

export default signUp

const styles = StyleSheet.create({
    container:{
        flex:1,
        gap: 45,
        paddingHorizontal: wp(5),
    },
    WelcomeText:{
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    form:{
        gap: 25,
    },
    forgotPassword:{
        textAlign: 'right',
        color: theme.colors.semibold,
        color: theme.colors.text,
    },
    footer:{
        flexDirection: 'row',   
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5, 
    },
    footerText:{
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6),  
    }
})