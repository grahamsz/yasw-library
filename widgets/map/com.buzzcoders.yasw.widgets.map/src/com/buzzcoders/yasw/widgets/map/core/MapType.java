/*******************************************************************************
 * Copyright (c) 2014 Massimo Rabbi.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 * 
 * Contributors:
 *     Massimo Rabbi <mrabbi@users.sourceforge.net> - initial API and implementation
 ******************************************************************************/
package com.buzzcoders.yasw.widgets.map.core;

import com.buzzcoders.yasw.widgets.map.messages.Messages;

/**
 * The common types that can be set on a Google Map.
 * 
 * @author Massimo Rabbi (mrabbi@users.sourceforge.net)
 * @see Marker
 * @see {@link https://developers.google.com/maps/documentation/javascript/reference#MapTypeId}
 *
 */
public enum MapType {
	ROADMAP("roadmap","google.maps.MapTypeId.ROADMAP"), //$NON-NLS-1$ //$NON-NLS-2$
	SATELLITE("satellite","google.maps.MapTypeId.SATELLITE"), //$NON-NLS-1$ //$NON-NLS-2$
	TERRAIN("terrain","google.maps.MapTypeId.TERRAIN"), //$NON-NLS-1$ //$NON-NLS-2$
	HYBRID("hybrid","google.maps.MapTypeId.HYBRID"); //$NON-NLS-1$ //$NON-NLS-2$
	
	private String stringID;
	private String googleConstant;
	
	private MapType(String stringID, String googleConstant) {
		this.stringID=stringID;
		this.googleConstant=googleConstant;
	}

	public String getStringID() {
		return stringID;
	}

	public String getGoogleConstant() {
		return googleConstant;
	}

	public static MapType fromStringID(String stringID){
		for(MapType val : MapType.values()) {
			if(val.getStringID().equals(stringID)) {
				return val;
			}
		}
		throw new IllegalArgumentException(Messages.MapType_InvalidType);
	}
}
