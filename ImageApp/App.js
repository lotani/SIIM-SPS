// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  * @flow
//  */

// import React, { Component } from 'react';
// import {
//   Platform,
//   StyleSheet,
//   Dimensions,
//   Text,
//   View,
//   NativeModules
// } from 'react-native';
// import Camera from 'react-native-camera';

// const instructions = Platform.select({
//   ios: 'Press Cmd+R to reload,\n' +
//     'Cmd+D or shake for dev menu',
//   android: 'Double tap R on your keyboard to reload,\n' +
//     'Shake or press menu button for dev menu',
// });

// export default class App extends Component<{}> {
  
//   takePicture() {
//     const options = {
//       target: Camera.constants.CaptureTarget.memory
//     };
    
//     this.camera.capture(options)
//       .then((result) => {
//         console.log(result);
//         const body = new FormData()
//         fetch('https://api.imgur.com/3/image', {
//           method: 'POST',
//           headers: {
//             'authorization': 'Client-ID 1e9d0bad8e66dcb',
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             image: result.data,
//             type: 'base64',
//             name: 'test-image-dahors12-31231',
//             title: '12390u21985yy8342',
//           }),
//         }).then(response => {
//             console.log(response)
//         })
//         .catch(error => { console.log(error)})
//       })
//       .catch(err => console.log(err));
//   }

//   render() {
//     return (
//       <View style={styles.container}>
//         <Camera
//            ref={(cam) => {
//              this.camera = cam;
//            }}
//            style={styles.preview}
//            aspect={Camera.constants.Aspect.fill}>
//            <Text style={styles.capture} onPress={this.takePicture.bind(this)}>[CAPTURE]</Text>
//        </Camera>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//   },
//   preview: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     height: Dimensions.get('window').height,
//     width: Dimensions.get('window').width
//   },
//   capture: {
//      flex: 0,
//      backgroundColor: '#fff',
//      borderRadius: 5,
//      color: '#000',
//      padding: 10,
//      margin: 40
//    }
// });

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Camera from 'react-native-camera';

// import { ImageAPI } from ''

export default class App extends Component<{}> {

  takePicture() {
    const options = {
      target: Camera.constants.CaptureTarget.memory
    };
    this.camera.capture(options)
      .then((output) => { 

        this.fetchFaceTags(output.data);
      })
      .catch(err => console.error(err));
  }

  fetchFaceTags(data) {
    fetch(
      'http://vr-endpoint.mybluemix.net/api',{
        // 'http://192.168.0.5:3000/api', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "images_file" : 'data:image/jpeg;base64,' + data
        })
      }
    ).then((response) => { return response.json() } )
    .then((response) => {
      console.log(response);
      this.triggerAlert(response);
    });
  }
 
  triggerAlert(response) {
    var msg = "";
    if(response.faces.length > 0){
      msg += "Faces identificadas: " + response.faces.length + "\n";
    }
    if(response.classes.length > 0){
      msg += "Objetos detectados: "
      response.classes.forEach((elem, index) => {
        if(index < response.classes.length - 1){
          msg += elem + ", ";
        } else { 
          msg += elem;
        }
      })
    }
    window.alert(msg);
  }



  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}
          captureQuality={Camera.constants.CaptureQuality.medium}>
          <Text style={styles.capture} onPress={this.takePicture.bind(this)}>[CAPTURE]</Text>
        </Camera>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    flexDirection: 'row',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  }
});
 