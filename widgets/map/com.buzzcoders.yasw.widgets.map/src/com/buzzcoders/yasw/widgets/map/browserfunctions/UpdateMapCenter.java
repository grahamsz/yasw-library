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
package com.buzzcoders.yasw.widgets.map.browserfunctions;

import org.eclipse.swt.browser.Browser;

import com.buzzcoders.yasw.widgets.map.core.LatLng;
import com.buzzcoders.yasw.widgets.map.support.GMapUtils;
import com.buzzcoders.yasw.widgets.map.support.JavaMapSupport;

/**
 * Browser function invoked when the map center is updated.
 * 
 * @author Massimo Rabbi (mrabbi@users.sourceforge.net)
 *
 */
public class UpdateMapCenter extends GMapEnabledFunction {

	public UpdateMapCenter(Browser browser, String name,
			JavaMapSupport mapSupport) {
		super(browser, name, mapSupport);
	}

	@Override
	public Object function(Object[] arguments) {
		LatLng newPosition = GMapUtils.getPosition(arguments);
		getMapSupport().setMapCenter(newPosition);
		return null;
	}
}
