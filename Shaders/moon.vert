// -*-C++-*-

// Shader that uses OpenGL state values to do per-pixel lighting
//
// The only light used is gl_LightSource[0], which is assumed to be
// directional.
//
#version 120
#define MODE_OFF 0
#define MODE_DIFFUSE 1
#define MODE_AMBIENT_AND_DIFFUSE 2

varying vec3 ecViewDir;

varying vec3 VNormal;
varying vec3 VTangent;
//varying vec3 VBinormal;

attribute vec3 tangent;
//attribute vec3 binormal;

void main()
{
  //eye position in model coordinates
  vec4 ep = gl_ModelViewMatrixInverse * vec4(0.0,0.0,0.0,1.0);
  //vertex to eye direction in screen space
  ecViewDir = (gl_ModelViewMatrix * (ep - gl_Vertex)).xyz;
  
  gl_Position = ftransform();    
  gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;

  VNormal = gl_NormalMatrix * gl_Normal;
  VTangent  = gl_NormalMatrix * tangent;
  //  VBinormal = gl_NormalMatrix * binormal;
  
}
