// -*-C++-*-

#version 120

varying vec3 ecViewDir;

varying vec3 VNormal;
varying vec3 VTangent;

uniform sampler2D texture;
uniform sampler2D normal_texture;

//highest range 18km
//radius 1737
uniform float relief_vscale = 0.01;

//vertical sampling
uniform float nbase = 30.0;


vec3 filter_combined (in vec3 color) ;


vec2 parallax_constant_mapping(vec2 texCoords, vec3 viewDir)
{ 
  float height = 0.5 - texture2D(normal_texture, texCoords).a;    
  return viewDir.st * (height * relief_vscale) + texCoords;
}



vec2 parallax_interstep_mapping(vec2 texCoords, vec3 viewDir)
{
  vec3 mover;
  vec3 dview;
  
  float sdir;
  float height;
  float prevheight = 0.0;

  float weight=0.0;

  float nsteps = nbase/max(0.2,viewDir.z);
  float stepsize = relief_vscale/nbase;
  
  mover = vec3(texCoords,0.0);
  
  height = relief_vscale * (0.5 - texture2D(normal_texture, mover.xy).a);
  
  sdir = sign(height);
  dview = sdir * viewDir * stepsize;
  
  
  for (int i=0; i<nsteps; i++)
    {
            
      if ( sdir*(mover.z - height) > 0.0 )
	{
	  //necessarily overshot, linear interpolation
	  weight = (mover.z-height)/(dview.z + prevheight-height);
	  break;
	}

      mover += dview;

      prevheight = height;
      height = relief_vscale * (0.5 - texture2D(normal_texture, mover.xy).a);

      
    }

  return mover.st - dview.st*weight;
  
}





void main()
{
  vec3 N, B, T;
  vec3 V;
  vec3 n;
  float cL;
  //float NdotL, NdotE;
  float ndotL, ndotE, EdotL;
  vec4 color = gl_Color;

  vec3 lightDir = normalize(gl_LightSource[0].position.xyz);
  vec3 EmDir = normalize(ecViewDir);
    
  vec4 texel, normal_texel;
  vec4 fragColor;
      
  N = normalize(VNormal);

  T = normalize(VTangent);  
  B = normalize(cross(N, T));
  //B = normalize(VBinormal);

  V = vec3(dot(T,EmDir),dot(B,EmDir),dot(N,EmDir));
  
  vec2 texCoord = gl_TexCoord[0].st;

  texCoord = parallax_interstep_mapping(texCoord,V);

  texel = texture2D(texture, texCoord.st);
  texel.a = 1.0;
  
  normal_texel = texture2D(normal_texture, texCoord.st);

  n = normalize(2.0 * normal_texel.rgb - 1.0);

  //issue here with the normalmap B -> -B ???
  n = normalize(n.x * T - n.y * B + n.z * N);

  //washes the zebra on flats
  //NdotL = clamp( dot(N, lightDir), 0.0, 1.0);
  //NdotE = clamp( dot(N, EmDir), 0.0, 1.0);
  // ndotL = clamp( dot(n, lightDir), NdotL, 1.0);
  // ndotE = clamp( dot(n, EmDir), NdotE, 1.0);
  
  ndotL = clamp( dot(n, lightDir), 0.0, 1.0);
  ndotE = clamp( dot(n, EmDir), 0.0, 1.0);
  
  if (ndotL > 0.0)
    {

    EdotL = dot(EmDir,lightDir);
    // arXiv:1701.0855

    cL = 0.9 - 0.01*acos(EdotL);
    color += ndotL *(2.0*cL/(ndotL + ndotE) + 1.0-cL);

    }
      

  fragColor = color * texel;
		        
  fragColor.rgb = filter_combined(fragColor.rgb);

  gl_FragColor = clamp(fragColor, 0.0, 1.0);

}
