// -*-C++-*-

#version 120


varying vec3 ecViewDir;
varying vec3 VNormal;

uniform sampler2D texture;

vec3 filter_combined (in vec3 color) ;


void main()
{
  vec3 N;
  float NdotL, NdotE, EdotL, cL;
  vec4 color = gl_Color;

  vec3 lightDir = normalize(gl_LightSource[0].position.xyz);
  vec3 EmDir = normalize(ecViewDir);
   
  vec4 texel;
  vec4 fragColor;

  N = normalize(VNormal);
		 
  texel = texture2D(texture, gl_TexCoord[0].st);
  texel.a = 1.0;       
   
  NdotL = dot(N, lightDir);

  if (NdotL > 0.0) {

    NdotE = dot(N, EmDir);
    EdotL = dot(EmDir,lightDir);
    // arXiv:1701.0855
    cL = 0.9 - 0.01*acos(EdotL);
    color += NdotL * (2.0*cL/(NdotL+NdotE) + 1.0-cL);
    
  }
        
  fragColor = color * texel;
		        
  fragColor.rgb = filter_combined(fragColor.rgb);

  gl_FragColor = clamp(fragColor, 0.0, 1.0);

}
