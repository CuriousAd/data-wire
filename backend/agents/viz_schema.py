from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class ChartDataPoint(BaseModel):
    label: str = Field(description="The X-axis label or category name")
    value: float = Field(description="The primary numerical value")
    value2: Optional[float] = Field(default=None, description="An optional secondary numerical value for comparison")
    group: Optional[str] = Field(default=None, description="Category group for stacked charts or groupings")
    highlighted: bool = Field(default=False, description="Set to true if this point is anomalous or should be highlighted")

class ForecastPoint(BaseModel):
    label: str = Field(description="The future X-axis label (e.g., date)")
    predicted: float = Field(description="The predicted numerical value")
    lower_bound: float = Field(description="The lower bound of the 95% confidence interval")
    upper_bound: float = Field(description="The upper bound of the 95% confidence interval")

class MapDataPoint(BaseModel):
    country_iso3: str = Field(description="ISO-3166-1 alpha-3 country code (e.g., USA, CHN, IND)")
    value: float = Field(description="Numerical value associated with the region")
    tooltip: str = Field(description="Text to display when hovering over the country")

class VizConfig(BaseModel):
    viz_type: Literal['bar', 'line', 'pie', 'scatter', 'area', 'composed', 'map', 'table'] = Field(
        description="The type of chart to render. Line=trends, bar=comparisons, pie=proportions, map=geographical, composed=mixed metric"
    )
    title: str = Field(description="A descriptive title for the chart")
    x_label: Optional[str] = Field(default=None, description="Label for the X-axis")
    y_label: Optional[str] = Field(default=None, description="Label for the Y-axis")
    
    data: Optional[List[ChartDataPoint]] = Field(default=None, description="The primary data points for standard charts")
    forecast: Optional[List[ForecastPoint]] = Field(default=None, description="Forecasting data, usually appended after current data")
    
    map_region: Optional[str] = Field(default="world", description="Geographic region to focus on (world, asia, europe, etc.)")
    map_data: Optional[List[MapDataPoint]] = Field(default=None, description="Data points mapped to geographic regions")
    
    color_scheme: Literal['default', 'financial', 'risk', 'geo'] = Field(
        default='default',
        description="Color palette. financial=green/red, risk=amber/red, geo=blue"
    )
    show_legend: bool = Field(default=True, description="Whether to show the chart legend")
    stacked: bool = Field(default=False, description="Whether bars/areas should be stacked")
