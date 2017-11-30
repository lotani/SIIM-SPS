import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Camera from 'react-native-camera';

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
          <Text style={styles.capture} onPress={this.takePicture.bind(this)}>[CAPTURAR]</Text>
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
 